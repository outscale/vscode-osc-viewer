// Globals
let cy                     // Global cytoscape instance
let vscode                 // VS Code API instance, can only be fetched once
let labelField = 'label'   // Which field to show in labels
let showEdges = true
let imagePrefix

//
// Initialize the Cytoscope container, and send message we're done
//
function init(prefix) {
  imagePrefix = prefix
  // Important step initializes main Cytoscape object 'cy'

  cy = cytoscape({
    container: document.getElementById('mainview'),
    wheelSensitivity: 0.15,
    maxZoom: 5,
    selectionType: 'single',
    ready: function () {
      this.expandCollapse({
        layoutBy: {
          name: 'dagre',
          animate: 'end',
          randomize: false,
          fit: false
        },
        fisheye: false,
        animate: true,
        undoable: false,
        cueEnabled: true,
        expandCollapseCuePosition: 'top-left',
        expandCollapseCueSize: 16,
        expandCollapseCueLineSize: 24,
        expandCollapseCueSensitivity: 1,
        expandCueImage: imagePrefix + '/toolbar/maximize-expand.svg', // image of expand icon if undefined draw regular expand cue
        collapseCueImage: imagePrefix + '/toolbar/minimize-collapse.svg',
        edgeTypeInfo: 'edgeType',
        groupEdgesOfSameTypeOnCollapse: true,
        allowNestedEdgeCollapse: true,
        zIndex: 999
      })
    }
  })

  // Handle selection events
  cy.on('select', evt => {
    // Only work with nodes, user can't select edges/arrows
    if (evt.target.isNode()) {

      // Force selection of single nodes only
      if (cy.$('node:selected').length > 1) {
        cy.$('node:selected')[0].unselect()
      }

      document.getElementById('details').disabled = false

    }
  })

  var defaults = {
    container: false, // html dom element
    viewLiveFramerate: 0, // set false to update graph pan only on drag end; set 0 to do it instantly; set a number (frames per second) to update not more than N times per second
    thumbnailEventFramerate: 30, // max thumbnail's updates per second triggered by graph updates
    thumbnailLiveFramerate: false, // max thumbnail's updates per second. Set false to disable
    dblClickDelay: 200, // milliseconds
    removeCustomContainer: false, // destroy the container specified by user on plugin destroy
    rerenderDelay: 100 // ms to throttle rerender updates to the panzoom for performance
  }

  cy.navigator(defaults)

  // Send message that we're initialized and ready for data
  vscode = acquireVsCodeApi()
  vscode.postMessage({ command: 'initialized' })
}

//
// Called with new or refreshed data
//
function displayData(data) {
  cy.remove('*')
  cy.add(data)
  var api = cy.expandCollapse('get')

  // Collapse node at startup
  cy.nodes().forEach(e => {
    if (e.data('collapse')) {
      api.collapse(e)
    }
  })

  reLayout()
}

//
// Layout the view of nodes given current data
//
function reLayout() {
  // Set colors in keeping with VS code theme (might be dark or light)
  const borderColor = window.getComputedStyle(document.getElementsByTagName('button')[0]).getPropertyValue('background-color')

  cy.style().selector('core').style({
    'active-bg-size': 0
  })

  // Style of nodes, i.e. resources.
  cy.style().selector('node').style({
    'label': node => { return decodeURIComponent(node.data(labelField)) },
    'background-image': node => { return node.data('img') === undefined ? 'none' :imagePrefix + '/node/' + node.data('img') },
    'background-color': node => { return node.data('color') === undefined ? 'transparent' : node.data('color') },
    'background-opacity': node => { return node.data('color') === undefined ? 0 : 1 },
    'background-width': '100%',
    'background-height': '100%',
    'width': '128px',
    'height': '128px',
    'font-family': 'system-ui',
    'font-size': '20px',
    'shape': 'rectangle',
  })

  // Bounding box for selected nodes
  cy.style().selector('node:selected').style({
    'border-width': '4',
    'border-color': borderColor
  })

  // Edges are arrows between resources
  cy.style().selector('edge').style({
    'target-arrow-shape': 'triangle',
    'curve-style': 'bezier',
    'width': 1,
    'line-color': '#000',
    'label': node => { return decodeURIComponent(node.data(labelField)) },
    'font-size': '10px',
    'font-family': 'system-ui',
  })

  // style for node that contains node
  cy.style().selector('$node > node').style({
    'background-color': node => {return node.data('color') === undefined ? 'transparent' : node.data('color')},
    'background-opacity': node => {return node.data('color') === undefined ? 0 :1},
    'color': '#000',
    'shape': 'rectangle',
    'text-opacity': '0.56',
    'font-size': '20px',
    'text-transform': 'uppercase',
    'text-wrap': 'none',
    'text-max-width': '75px',
    'padding-top': '16px',
    'padding-left': '16px',
    'padding-bottom': '16px',
    'padding-right': '16px',
    'font-family': 'system-ui',

  })

  // style for collapse node
  cy.style().selector('node.cy-expand-collapse-collapsed-node').style({
    'background-image': node => { return node.data('id').startsWith('vmgroup') ? imagePrefix + '/node/design/VMs@2x.png' : undefined},
    'background-color': node => { return node.data('id').startsWith('vmgroup') ? undefined : '#f2d891'},
    'background-opacity': node => { return node.data('id').startsWith('vmgroup') ? 0 : 1},
    'background-width': '100%',
    'background-height': '100%',
  })

  // style for parent (counpound node)
  cy.style().selector(':parent').style({
    'text-valign': 'top',
    'text-halign': 'center'
  })

  // Re-layout nodes in given mode, resizing and fitting too
  cy.style().update()
  cy.resize()


  cy.layout({
    name: 'dagre',
    animate: 'end',
    randomize: true,
    fit: true,
    padding: 24,
    spacingFactor: 1.2,

  }).run()

  cy.fit()
}

function resize() {
  if (cy) {
    cy.resize()
    cy.fit()
  }
}

//
// **** VS Code extension WebView specific functions below here ****
//

// Message handler in webview, messages are sent by extension.ts
window.addEventListener('message', event => {
  if (! event.origin.startsWith('vscode-webview://')) {
    return
  }
  // Get message content
  const message = event.data

  if (message.command == 'newData') {
    document.getElementById('mainview').style.display = 'block'
    document.getElementById('buttons').style.display = 'block'
    document.querySelector('.loader').style.display = 'none'


    // Call main display function (above)
    displayData(message.payload)
  }
})


function exportPNG() {
  if (cy) {
    const data = cy.png({ full: true, output: 'base64' })
    vscode.postMessage({ command: 'exportPNG', payload: data })
  }
}

function showDetails() {
  if (cy) {
    const nodeSelected = cy.$('node:selected')[0]
    vscode.postMessage({
      command: 'showDetails', payload: {
        resourceType: nodeSelected.data('type'),
        resourceId: nodeSelected.data('resourceId'),
      }
    })
  }
}

function toggleEdges() {
  showEdges = ! showEdges
  cy.style().selector('edges').style({
    display: showEdges ? 'element': 'none'
  }).update()
}