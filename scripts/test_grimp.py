from grimp import build_graph

graph = build_graph("pyimportgraph")  # your top-level package

print(graph.modules)
print(graph.find_children("pyimportgraph.scan"))
