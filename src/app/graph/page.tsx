"use client";

import { useState, useEffect } from "react";
import { MotionDiv } from "@/components/ui/motion";
import { NotesGraph } from "@/components/features/NotesGraph";
import { 
  FileText,
  Network,
  Search,
  Hash,
  Link,
  TrendingUp,
  Target,
  Activity
} from "lucide-react";
import { NoteService } from "@/services/NoteService";
import { Note } from "@/types/Note";

interface GraphNode {
  id: string;
  title: string;
  tags: string[];
  size: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
  strength: number;
}

export default function GraphPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({ nodes: [], links: [] });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [notesData, graphDataResponse] = await Promise.all([
        NoteService.getAll(),
        NoteService.getGraphData()
      ]);
      
      setNotes(notesData);
      setGraphData(graphDataResponse);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node: GraphNode) => {
    const note = notes.find(n => n.id === node.id);
    setSelectedNote(note || null);
  };

  const getGraphStats = () => {
    const totalNodes = graphData.nodes.length;
    const totalLinks = graphData.links.length;
    const averageConnections = totalNodes > 0 ? (totalLinks * 2) / totalNodes : 0;
    const mostConnected = graphData.nodes.reduce((max, node) => {
      const connections = graphData.links.filter(link => 
        link.source === node.id || link.target === node.id
      ).length;
      return connections > max.connections ? { node, connections } : max;
    }, { node: null as GraphNode | null, connections: 0 });

    const tagDistribution = graphData.nodes.reduce((acc, node) => {
      node.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const topTags = Object.entries(tagDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      totalNodes,
      totalLinks,
      averageConnections: Math.round(averageConnections * 10) / 10,
      mostConnected,
      topTags
    };
  };

  const stats = getGraphStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Network className="w-8 h-8 text-teal-500" />
            <h1 className="text-4xl font-bold gradient-text">
              Knowledge Graph
            </h1>
          </div>
          <p className="text-muted-foreground">
            Visualize connections between your notes and discover knowledge patterns
          </p>
        </MotionDiv>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Graph Visualization */}
          <div className="xl:col-span-3">
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <NotesGraph
                nodes={graphData.nodes}
                links={graphData.links}
                onNodeClick={handleNodeClick}
                className="h-[700px]"
              />
            </MotionDiv>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Graph Statistics */}
            <MotionDiv
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-effect rounded-xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-teal-500" />
                <h2 className="text-lg font-semibold">Graph Statistics</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Notes</span>
                  <span className="font-semibold">{stats.totalNodes}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Connections</span>
                  <span className="font-semibold">{stats.totalLinks}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Connections</span>
                  <span className="font-semibold">{stats.averageConnections}</span>
                </div>
                
                {stats.mostConnected.node && (
                  <div className="pt-2 border-t border-border/40">
                    <div className="text-sm text-muted-foreground mb-1">Most Connected</div>
                    <div className="font-medium text-sm truncate" title={stats.mostConnected.node.title}>
                      {stats.mostConnected.node.title}
                    </div>
                    <div className="text-xs text-teal-500">
                      {stats.mostConnected.connections} connections
                    </div>
                  </div>
                )}
              </div>
            </MotionDiv>

            {/* Top Tags */}
            <MotionDiv
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-effect rounded-xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold">Popular Tags</h2>
              </div>
              
              <div className="space-y-2">
                {stats.topTags.map(([tag, count], index) => (
                  <div key={tag} className="flex justify-between items-center">
                    <span className="text-sm text-purple-400">#{tag}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
                
                {stats.topTags.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No tags found
                  </div>
                )}
              </div>
            </MotionDiv>

            {/* Selected Note Details */}
            {selectedNote && (
              <MotionDiv
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-effect rounded-xl p-6 shadow-xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-teal-500" />
                  <h2 className="text-lg font-semibold">Selected Note</h2>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-sm mb-1 truncate" title={selectedNote.title}>
                      {selectedNote.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {selectedNote.content.substring(0, 150)}
                      {selectedNote.content.length > 150 && '...'}
                    </p>
                  </div>
                  
                  {selectedNote.tags.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Tags</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedNote.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedNote.linkedNoteIds.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        <Link className="w-3 h-3 inline mr-1" />
                        Linked Notes ({selectedNote.linkedNoteIds.length})
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border/40">
                    Updated {new Date(selectedNote.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </MotionDiv>
            )}

            {/* Instructions */}
            <MotionDiv
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-effect rounded-xl p-6 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold">How to Use</h2>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Click and drag nodes to rearrange</p>
                <p>• Hover over nodes to highlight connections</p>
                <p>• Use search to filter notes</p>
                <p>• Create backlinks with [[Note Title]] syntax</p>
                <p>• Click "Reheat" to restart the simulation</p>
              </div>
            </MotionDiv>
          </div>
        </div>
      </div>
    </div>
  );
} 