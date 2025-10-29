import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Note } from '../shared/types';
import { buildMindmapFromSummaries, getMindmapAIStatus } from '../shared/utils/summarizerMindmap';

interface MindMapProps {
  notes: Note[];
  onNoteClick?: (noteId: string) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  noteId: string;
  group: number;
  children?: GraphNode[];
  _children?: GraphNode[];  // 折叠的子节点
  depth?: number;
  x?: number;
  y?: number;
  parent?: GraphNode;
}

const MindMap: React.FC<MindMapProps> = ({ notes, onNoteClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [aiStatus, setAiStatus] = useState<string>('');
  const hierarchyRootRef = useRef<any>(null);
  const [mindmapData, setMindmapData] = useState<any>(null);
  const hasRenderedRef = useRef(false);

  // 监听视图变化，重置渲染标记
  useEffect(() => {
    hasRenderedRef.current = false;
  }, []);

  useEffect(() => {
    if (!svgRef.current || notes.length === 0) return;

    // 只在笔记数据变化时重新构建
    if (!mindmapData || mindmapData.noteCount !== notes.length) {
      buildMindmapAsync();
    } else if (!hasRenderedRef.current && mindmapData) {
      // 切换回来时，使用缓存数据渲染
      renderVisualization(mindmapData.nodes, mindmapData.links);
      hasRenderedRef.current = true;
    }
  }, [notes.length, mindmapData]); // 监听笔记数量和数据变化

  const buildMindmapAsync = async () => {
    if (!svgRef.current) return;

    setIsBuilding(true);

    try {
      // Check AI status
      const status = await getMindmapAIStatus();
      setAiStatus(status.message);
      console.log('[MindMap] 🎯', status.message);

      // Clear previous content
      d3.select(svgRef.current).selectAll('*').remove();

      // Build data using AI Summarizer
      const { nodes, links } = await buildMindmapFromSummaries(notes);

      // 保存数据以便重用
      setMindmapData({ nodes, links, noteCount: notes.length });

      // Render visualization
      renderVisualization(nodes, links);
      hasRenderedRef.current = true;
    } catch (error) {
      console.error('[MindMap] ❌ Build failed:', error);
    } finally {
      setIsBuilding(false);
    }
  };

  const renderVisualization = (nodes: any[], links: any[]) => {
    if (!svgRef.current) return;

    // SVG dimensions
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create zoom container
    const g = svg.append('g');

    // 将扁平的 nodes 和 links 转换为层次结构
    const buildHierarchy = (nodes: any[], links: any[]) => {
      const nodeMap = new Map(nodes.map(n => [n.id, { ...n, children: [] }]));
      
      links.forEach(link => {
        const parent = nodeMap.get(typeof link.source === 'string' ? link.source : link.source.id);
        const child = nodeMap.get(typeof link.target === 'string' ? link.target : link.target.id);
        if (parent && child) {
          parent.children.push(child);
        }
      });
      
      return nodeMap.get('root') || nodeMap.values().next().value;
    };

    const hierarchyData = buildHierarchy(nodes, links);
    const root = d3.hierarchy(hierarchyData);
    
    // Store root for updates
    hierarchyRootRef.current = root;

    const treeLayout = d3.tree<any>()
      .size([height - 100, width - 200])
      .separation((a, b) => {
        // 如果是叶子节点，增加间距
        const aIsLeaf = !a.children;
        const bIsLeaf = !b.children;
        
        if (aIsLeaf || bIsLeaf) {
          return a.parent === b.parent ? 1.5 : 2;
        }
        return a.parent === b.parent ? 1 : 1.2;
      })
      .nodeSize([100, 250]); // 增加节点大小，给矩形更多空间

    const treeData = treeLayout(root);
    
    // Update node positions
    const updateVisualization = () => {
      const descendants = treeData.descendants();
      const treeLinks = treeData.links();
      
      return { descendants, treeLinks };
    };
    
    const { descendants, treeLinks } = updateVisualization();

    // Create links as curved paths
    const link = g
      .append('g')
      .selectAll('path')
      .data(treeLinks)
      .join('path')
      .attr('d', d3.linkHorizontal<any, any>()
        .x((d: any) => d.y)
        .y((d: any) => d.x)
      )
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // 提取节点渲染逻辑为函数
    const renderNodes = (container: any, data: any[]) => {
      const nodeGroup = container
        .append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(data)
        .join('g')
        .attr('class', 'node')
        .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
        .attr('cursor', 'pointer')
        .on('click', function(event: any, d: any) {
          event.stopPropagation();
          
          // 如果是笔记节点（有 noteId）
          if (d.data.noteId) {
            console.log('[MindMap] 📝 Clicked note:', d.data.noteId);
            onNoteClick?.(d.data.noteId);
            return;
          }
          
          // 如果是分类节点（有子节点），切换折叠状态
          if (d.children || d._children) {
            if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            
            // 清除并重新渲染
            if (!svgRef.current) return;
            
            const svgElement = d3.select(svgRef.current);
            svgElement.selectAll('*').remove();
            const gNew = svgElement.append('g');
            
            // 重新计算布局
            const newTreeData = treeLayout(hierarchyRootRef.current);
            const newDescendants = newTreeData.descendants();
            const newLinks = newTreeData.links();
            
            // 重新创建连线
            gNew.append('g')
              .attr('class', 'links')
              .selectAll('path')
              .data(newLinks)
              .join('path')
              .attr('d', d3.linkHorizontal<any, any>()
                .x((d: any) => d.y)
                .y((d: any) => d.x)
              )
              .attr('fill', 'none')
              .attr('stroke', '#cbd5e1')
              .attr('stroke-width', 2)
              .attr('stroke-opacity', 0.6);
            
            // 重新创建节点
            renderNodes(gNew, newDescendants);
            
            // 重新应用缩放
            const newZoom = d3
              .zoom<SVGSVGElement, unknown>()
              .scaleExtent([0.5, 3])
              .on('zoom', (event) => {
                gNew.attr('transform', event.transform);
              });
            
            svgElement.call(newZoom);
            svgElement.call(newZoom.transform as any, d3.zoomIdentity.translate(50, height / 2).scale(0.9));
          }
        });
      
      // 添加节点形状（叶子节点用矩形，其他用圆形）
      nodeGroup.each(function(this: SVGGElement, d: any) {
        const node = d3.select(this);
        const isLeaf = !d.children && !d._children;
        
        if (isLeaf) {
          // 叶子节点：长方形（稍小一些，避免遮挡）
          node.append('rect')
            .attr('x', -70)
            .attr('y', -20)
            .attr('width', 140)
            .attr('height', 40)
            .attr('rx', 6)
            .attr('ry', 6)
            .attr('fill', (dd: any) => getColorByGroup(dd.data.group))
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);
        } else {
          // 非叶子节点：圆形
          node.append('circle')
            .attr('r', 35)
            .attr('fill', (dd: any) => getColorByGroup(dd.data.group))
            .attr('stroke', '#fff')
            .attr('stroke-width', 3);
        }
      });
      
      // 添加展开/折叠指示器
      nodeGroup
        .filter((d: any) => d.children || d._children)
        .append('circle')
        .attr('r', 10)
        .attr('cx', 25)
        .attr('cy', 25)
        .attr('fill', '#fff')
        .attr('stroke', '#cbd5e1')
        .attr('stroke-width', 2);
      
      nodeGroup
        .filter((d: any) => d.children || d._children)
        .append('text')
        .attr('class', 'toggle-icon')
        .attr('x', 25)
        .attr('y', 25)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#64748b')
        .text((d: any) => d.children ? '−' : '+');
      
      // 添加文本标签
      nodeGroup.each(function(this: SVGGElement, d: any) {
        const node = d3.select(this);
        const isLeaf = !d.children && !d._children;
        
        const textElement = node
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', '#fff')
          .attr('font-size', '12px')
          .attr('font-weight', '600')
          .attr('pointer-events', 'none');
        
        if (isLeaf) {
          // 叶子节点：单行文本，超长截断
          const maxWidth = 130; // 最大宽度（适配140宽度的矩形）
          let labelText = d.data.label;
          
          textElement.text(labelText);
          
          // 检查文本是否超出宽度
          const textNode = textElement.node();
          if (textNode && textNode.getComputedTextLength() > maxWidth) {
            // 逐步截断文本直到符合宽度
            while (labelText.length > 0 && textNode.getComputedTextLength() > maxWidth) {
              labelText = labelText.slice(0, -1);
              textElement.text(labelText + '...');
            }
          }
        } else {
          // 非叶子节点：多行文本
          const words = d.data.label.split(/\s+/);
          if (words.length > 2) {
            textElement.text('');
            textElement.append('tspan').text(words.slice(0, 2).join(' ')).attr('x', 0).attr('dy', '-0.3em');
            textElement.append('tspan').text(words.slice(2).join(' ')).attr('x', 0).attr('dy', '1.2em');
          } else {
            textElement.text(d.data.label);
          }
        }
      });
      
      nodeGroup.append('title').text((d: any) => d.data.label);
    };
    
    // 初始渲染节点（使用相同的渲染函数）
    renderNodes(g, descendants);

    // Zoom functionality
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Center the visualization
    const initialTransform = d3.zoomIdentity
      .translate(50, height / 2)
      .scale(0.9);
    
    svg.call(zoom.transform, initialTransform);
  };

  return (
    <div className="mindmap-container">
      {notes.length === 0 ? (
        <div className="empty-mindmap">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="2" />
            <circle cx="19" cy="5" r="2" stroke="currentColor" strokeWidth="2" />
            <circle cx="5" cy="19" r="2" stroke="currentColor" strokeWidth="2" />
            <circle cx="19" cy="19" r="2" stroke="currentColor" strokeWidth="2" />
          </svg>
          <h3>Mind Map is Empty</h3>
          <p>After creating some notes, a knowledge graph will be automatically generated here</p>
        </div>
      ) : (
        <>
          <div className="mindmap-info">
            <p>💡 Click nodes to expand/collapse, scroll to zoom for details</p>
            {aiStatus && (
              <p className="ai-status-badge">
                {aiStatus}
              </p>
            )}
            {isBuilding && (
              <p className="building-badge">
                🤖 Building mind map with AI...
              </p>
            )}
          </div>
          <svg ref={svgRef} className="mindmap-svg"></svg>
        </>
      )}
    </div>
  );
};

// Note: Data preparation logic has been moved to summarizerMindmap.ts
// Uses AI Summarizer API to automatically extract topics and establish semantic connections

/**
 * 获取节点颜色
 */
function getColorByGroup(group: number): string {
  // 使用语义化的颜色方案
  const colors = {
    root: '#1e293b',  // 根节点：深蓝灰色
    topics: [
      '#0ea5e9',  // 主题1：天蓝色
      '#8b5cf6',  // 主题2：紫色
      '#ec4899',  // 主题3：粉色
      '#f59e0b',  // 主题4：橙色
      '#10b981',  // 主题5：绿色
    ],
    subtopics: [
      '#38bdf8',  // 子主题1：浅蓝色
      '#a78bfa',  // 子主题2：浅紫色
      '#f472b6',  // 子主题3：浅粉色
      '#fbbf24',  // 子主题4：浅橙色
      '#34d399',  // 子主题5：浅绿色
    ]
  };

  if (group === 0) return colors.root;
  const topicIndex = (group - 1) % colors.topics.length;
  return colors.topics[topicIndex];
}

export default MindMap;

