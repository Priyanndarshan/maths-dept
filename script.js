// Initialize vis.js Network
let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);

// Create a network
const container = document.getElementById('graphContainer');
const data = {
    nodes: nodes,
    edges: edges
};
const options = {
    nodes: {
        shape: 'circle',
        size: 30,
        font: {
            size: 14
        },
        fixed: {
            x: false,
            y: false
        }
    },
    edges: {
        font: {
            size: 14
        },
        smooth: {
            enabled: true,
            type: 'dynamic',
            roundness: 0.5
        },
        width: 2
    },
    physics: {
        enabled: true,
        barnesHut: {
            gravitationalConstant: -2000,
            centralGravity: 0.3,
            springLength: 95,
            springConstant: 0.04,
            damping: 0.09
        },
        stabilization: {
            enabled: true,
            iterations: 1000,
            updateInterval: 100
        }
    },
    manipulation: {
        enabled: true,
        addNode: true,
        addEdge: true,
        deleteNode: true,
        deleteEdge: true
    },
    layout: {
        randomSeed: 2,
        improvedLayout: true,
        hierarchical: {
            enabled: false
        }
    },
    interaction: {
        hover: true,
        tooltipDelay: 200
    }
};
const network = new vis.Network(container, data, options);

// Add hover functionality to show degrees
network.on("hoverNode", function (params) {
    const nodeId = params.node;
    const degree = network.getConnectedEdges(nodeId).length;
    nodes.update({ id: nodeId, title: `Degree: ${degree}` });
});

// Parse edge list from textarea
document.getElementById('parseButton').addEventListener('click', () => {
    const input = document.getElementById('edgeListInput').value;
    const lines = input.trim().split('\n');
    
    // Clear existing graph
    nodes.clear();
    edges.clear();
    
    // First pass: Add all vertices
    const vertexLines = lines.filter(line => !line.includes(' '));
    vertexLines.forEach((line, index) => {
        const vertex = line.trim();
        nodes.add({ 
            id: vertex, 
            label: vertex
        });
    });
    
    // Second pass: Add all edges
    const edgeLines = lines.filter(line => line.includes(' '));
    edgeLines.forEach(line => {
        const [from, to, label] = line.trim().split(' ');
        edges.add({ from: from, to: to, id: label, label: label });
    });

    // Fit the graph to view after a short delay
    setTimeout(() => {
        network.fit({
            animation: {
                duration: 1000,
                easingFunction: 'easeInOutQuad'
            }
        });
    }, 100);
});

// Calculate ABC index
document.getElementById('calculateABC').addEventListener('click', () => {
    let abcIndex = 0;
    const tbody = document.querySelector('#abcCalculations tbody');
    tbody.innerHTML = ''; // Clear previous calculations
    
    const calculations = [];
    
    edges.forEach(edge => {
        const fromNode = edge.from;
        const toNode = edge.to;
        
        // Calculate degrees
        const fromDegree = network.getConnectedEdges(fromNode).length;
        const toDegree = network.getConnectedEdges(toNode).length;
        
        // Calculate ABC index contribution for this edge
        const sumDegreesMinus2 = fromDegree + toDegree - 2;
        const productDegrees = fromDegree * toDegree;
        const numerator = Math.sqrt(sumDegreesMinus2);
        const denominator = Math.sqrt(productDegrees);
        const termValue = numerator / denominator;
        abcIndex += termValue;

        // Store calculations
        calculations.push({
            edge: `(${fromNode},${toNode})`,
            fromDegree,
            toDegree,
            sumDegreesMinus2,
            productDegrees,
            termValue
        });
    });
    
    // Add all calculation rows
    calculations.forEach(calc => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${calc.edge}</td>
            <td>${calc.fromDegree}</td>
            <td>${calc.toDegree}</td>
            <td>${calc.sumDegreesMinus2}</td>
            <td>${calc.productDegrees}</td>
            <td>${calc.termValue.toFixed(4)}</td>
        `;
        tbody.appendChild(row);
    });

    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td>Total</td>
        <td colspan="4"></td>
        <td>${abcIndex.toFixed(4)}</td>
    `;
    tbody.appendChild(totalRow);
    
    document.getElementById('abcResult').textContent = abcIndex.toFixed(4);
});

// Clear graph
document.getElementById('clearGraph').addEventListener('click', () => {
    nodes.clear();
    edges.clear();
    document.getElementById('edgeListInput').value = '';
    document.getElementById('abcResult').textContent = '-';
    document.querySelector('#abcCalculations tbody').innerHTML = ''; // Clear calculation table
});

// Add event listener for window resize
window.addEventListener('resize', () => {
    network.fit({
        animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
        }
    });
}); 