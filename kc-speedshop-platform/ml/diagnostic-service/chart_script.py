import plotly.graph_objects as go
import json
import math

# JSON data
data = {
    "nodes": [
        {"id": "Diagnostic", "label": "Diagnostic Svc"},
        {"id": "Assistant", "label": "AI Assistant"},
        {"id": "Blockchain", "label": "Blockchain Svc"},
        {"id": "Marketplace", "label": "Marketplace"},
        {"id": "Analytics", "label": "Analytics Svc"},
        {"id": "RapidAPI", "label": "RapidAPI"},
        {"id": "Grok", "label": "X.AI Grok"},
        {"id": "Hedera", "label": "Hedera Hash"},
        {"id": "PostgreSQL", "label": "PostgreSQL"},
        {"id": "Kafka", "label": "Kafka"},
        {"id": "Redis", "label": "Redis"}
    ],
    "edges": [
        {"source": "Diagnostic", "target": "RapidAPI"},
        {"source": "Diagnostic", "target": "Grok"},
        {"source": "Diagnostic", "target": "Blockchain"},
        {"source": "Assistant", "target": "Grok"},
        {"source": "Marketplace", "target": "Blockchain"},
        {"source": "Marketplace", "target": "PostgreSQL"},
        {"source": "Blockchain", "target": "Hedera"},
        {"source": "Analytics", "target": "PostgreSQL"},
        {"source": "Analytics", "target": "Kafka"},
        {"source": "Diagnostic", "target": "Redis"},
        {"source": "Assistant", "target": "Redis"},
        {"source": "Blockchain", "target": "Redis"},
        {"source": "Marketplace", "target": "Redis"},
        {"source": "Analytics", "target": "Redis"}
    ]
}

# Define microservices and integrations
microservices = ["Diagnostic", "Assistant", "Blockchain", "Marketplace", "Analytics"]
integrations = ["RapidAPI", "Grok", "Hedera", "PostgreSQL", "Kafka", "Redis"]

# Create improved layout for better visibility
def create_layout(nodes):
    positions = {}
    
    # Position microservices in a vertical line on the left
    for i, node_id in enumerate(microservices):
        y = 2 - i * 1  # Spread vertically
        positions[node_id] = (-3, y)
    
    # Position integrations in a vertical arrangement on the right
    for i, node_id in enumerate(integrations):
        y = 2.5 - i * 0.9  # Spread vertically
        positions[node_id] = (3, y)
    
    return positions

positions = create_layout(data["nodes"])

# Create figure
fig = go.Figure()

# Add edges with arrows
for edge in data["edges"]:
    x0, y0 = positions[edge["source"]]
    x1, y1 = positions[edge["target"]]
    
    # Add line
    fig.add_trace(go.Scatter(x=[x0, x1], y=[y0, y1],
                             line=dict(width=2, color='#888'),
                             hoverinfo='none',
                             mode='lines',
                             showlegend=False,
                             cliponaxis=False))
    
    # Add arrow annotation
    fig.add_annotation(
        x=x1, y=y1,
        ax=x0, ay=y0,
        xref='x', yref='y',
        axref='x', ayref='y',
        showarrow=True,
        arrowhead=2,
        arrowsize=1,
        arrowwidth=2,
        arrowcolor='#888'
    )

# Add microservice nodes (blue)
micro_x = [positions[node_id][0] for node_id in microservices]
micro_y = [positions[node_id][1] for node_id in microservices]
micro_labels = [next(node["label"] for node in data["nodes"] if node["id"] == node_id) for node_id in microservices]

fig.add_trace(go.Scatter(x=micro_x, y=micro_y,
                         mode='markers+text',
                         marker=dict(size=40, color='#1f77b4'),
                         text=micro_labels,
                         textposition="middle center",
                         textfont=dict(size=10, color='white'),
                         hoverinfo='text',
                         hovertext=micro_labels,
                         name='Microservices',
                         showlegend=True,
                         cliponaxis=False))

# Add integration nodes (green)
int_x = [positions[node_id][0] for node_id in integrations]
int_y = [positions[node_id][1] for node_id in integrations]
int_labels = [next(node["label"] for node in data["nodes"] if node["id"] == node_id) for node_id in integrations]

fig.add_trace(go.Scatter(x=int_x, y=int_y,
                         mode='markers+text',
                         marker=dict(size=40, color='#2ca02c'),
                         text=int_labels,
                         textposition="middle center",
                         textfont=dict(size=10, color='white'),
                         hoverinfo='text',
                         hovertext=int_labels,
                         name='Integrations',
                         showlegend=True,
                         cliponaxis=False))

# Update layout
fig.update_layout(
    title='Karapiro Platform Architecture',
    showlegend=True,
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5),
    xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
    yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
    plot_bgcolor='white'
)

# Save the chart
fig.write_image("network_graph.png")