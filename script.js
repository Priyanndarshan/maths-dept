// Initialize vis.js Network
let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);

// Create a network
const container = document.getElementById('graphContainer');
const data = {
    nodes: nodes,
    edges: edges
};

// Simplified network options
const options = {
    nodes: {
        shape: 'circle',
        size: 25,
        color: {
            background: '#3498db',
            border: '#2980b9',
            highlight: {
                background: '#2ecc71',
                border: '#27ae60'
            }
        },
        font: {
            color: '#2c3e50',
            size: 16,
            face: 'Inter'
        }
    },
    edges: {
        color: {
            color: '#7f8c8d',
            highlight: '#2c3e50'
        },
        width: 2,
        font: {
            size: 14,
            color: '#34495e'
        },
        smooth: {
            enabled: true,
            type: 'continuous'
        }
    },
    physics: {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
            gravitationalConstant: -50,
            centralGravity: 0.01,
            springLength: 100,
            springConstant: 0.08,
            damping: 0.4
        },
        stabilization: {
            enabled: true,
            iterations: 200
        }
    },
    interaction: {
        hover: true,
        zoomView: false,
        dragView: false,
        multiselect: false
    },
    manipulation: false
};

const network = new vis.Network(container, data, options);

// Make visualization area visible when graph is created
function showVisualizationArea() {
    const visArea = document.querySelector('.visualization-area');
    visArea.classList.add('visible');
}

// Parse edge list from textarea
document.getElementById('parseButton').addEventListener('click', () => {
    const input = document.getElementById('edgeListInput').value;
    const lines = input.trim().split('\n');
    
    // Clear existing graph
    nodes.clear();
    edges.clear();
    
    // First pass: Add all vertices
    const vertexLines = lines.filter(line => !line.includes(' '));
    vertexLines.forEach(line => {
        const vertex = line.trim();
        if (vertex) {
            nodes.add({ 
                id: vertex, 
                label: vertex
            });
        }
    });
    
    // Second pass: Add all edges
    const edgeLines = lines.filter(line => line.includes(' '));
    edgeLines.forEach(line => {
        const parts = line.trim().split(' ');
        if (parts.length >= 2) {
            const [from, to, label] = parts;
            edges.add({ 
                from: from, 
                to: to, 
                id: label || `${from}-${to}`, 
                label: label || '' 
            });
        }
    });

    // Show visualization area
    showVisualizationArea();

    // Center the graph
    network.fit({
        animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
        }
    });
});

// Calculate ABC index
document.getElementById('calculateABC').addEventListener('click', () => {
    let abcIndex = 0;
    const tbody = document.querySelector('#abcCalculations tbody');
    tbody.innerHTML = ''; // Clear previous calculations
    
    const calculations = [];
    let hasValidCalculations = false;
    
    edges.forEach(edge => {
        const fromNode = edge.from;
        const toNode = edge.to;
        
        // Calculate degrees
        const fromDegree = network.getConnectedEdges(fromNode).length;
        const toDegree = network.getConnectedEdges(toNode).length;
        
        // Calculate ABC index contribution for this edge
        const sumDegreesMinus2 = fromDegree + toDegree - 2;
        const productDegrees = fromDegree * toDegree;
        
        let termValue = 0;
        
        // Check for valid conditions before calculation
        if (productDegrees > 0 && sumDegreesMinus2 >= 0) {
            const numerator = Math.sqrt(sumDegreesMinus2);
            const denominator = Math.sqrt(productDegrees);
            termValue = numerator / denominator;
            abcIndex += termValue;
            hasValidCalculations = true;
        }

        // Store calculations
        calculations.push({
            edge: `(${fromNode},${toNode})`,
            fromDegree,
            toDegree,
            sumDegreesMinus2,
            productDegrees,
            termValue: termValue
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
            <td>${calc.productDegrees > 0 && calc.sumDegreesMinus2 >= 0 ? calc.termValue.toFixed(4) : 'Invalid'}</td>
        `;
        tbody.appendChild(row);
    });

    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td>Total</td>
        <td colspan="4"></td>
        <td>${hasValidCalculations ? abcIndex.toFixed(4) : 'Invalid Graph'}</td>
    `;
    tbody.appendChild(totalRow);

    // Update ABC result
    document.getElementById('abcResult').textContent = hasValidCalculations ? abcIndex.toFixed(4) : 'Invalid Graph';
});

// Clear graph and calculations
document.getElementById('clearGraph').addEventListener('click', () => {
    // Clear graph
    nodes.clear();
    edges.clear();
    
    // Clear input
    document.getElementById('edgeListInput').value = '';
    
    // Clear calculations
    document.querySelector('#abcCalculations tbody').innerHTML = '';
    document.getElementById('abcResult').textContent = '-';
    
    // Hide visualization area
    document.querySelector('.visualization-area').classList.remove('visible');
}); 