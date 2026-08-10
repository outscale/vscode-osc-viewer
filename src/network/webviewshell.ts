import * as vscode from 'vscode';
import * as path from 'path';

// Shared cytoscape.js webview shell (toolbar + live/health-summary dashboard controls) used by
// both the VPC network view and the OKS cluster view — the HTML/JS/CSS is entirely data-driven
// (assets/js/main.js knows nothing about VPCs or Kubernetes), so both views reuse it as-is.
export function getGraphWebviewContent(panel: vscode.WebviewPanel, extensionPath: string): string {
    const assetsPath = panel.webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, 'assets')));
    const iconThemeBase = panel.webview.asWebviewUri(
        vscode.Uri.file(path.join(extensionPath, 'assets', 'img')),
    ).toString();

    return `
    <!DOCTYPE html>
    <html lang="en">

    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">

      <script src="${assetsPath}/js/vendor/jquery-3.4.1.slim.min.js"></script>
      <script src="${assetsPath}/js/vendor/cytoscape-3.23.0.min.js"></script>
      <script src="${assetsPath}/js/vendor/layout-base.js"></script>
      <script src="${assetsPath}/js/vendor/dagre-0.7.4.min.js"></script>
      <script src="${assetsPath}/js/vendor/cytoscape-dagre-2.5.0.js"></script>
      <script src="${assetsPath}/js/vendor/collapse-4.1.0.js"></script>
      <script src="${assetsPath}/js/vendor/navigator-2.0.2.js"></script>

      <script src="${assetsPath}/js/main.js"></script>
      <link href="${assetsPath}/css/main.css" rel="stylesheet" type="text/css">
      <link href="${assetsPath}/css/navigator.css" rel="stylesheet" type="text/css">

      <title>Osc Viewer</title>
    </head>

    <body>
      <div id="buttons">
        <button onclick="resize()" title="Zoom to fit"><img src="${assetsPath}/img/toolbar/fit.svg"><span class="lab">&nbsp;
            Zoom to fit</span></button>
        <button onclick="reLayout()" title="Relayout"><img src="${assetsPath}/img/toolbar/fit.svg"><span class="lab">&nbsp;
            Relayout</span></button>
        <button onclick="exportPNG()" title="Export view as PNG"><img src="${assetsPath}/img/toolbar/export.svg"><span
            class="lab">&nbsp; Export</span></button>
        <button onclick="showDetails()" title="Export view as PNG" id="details" disabled="true"><img src="${assetsPath}/img/toolbar/zoom-in.svg"><span
            class="lab">&nbsp; Show</span></button>
            <button onclick="toggleEdges()" title="Toggle Edges"><img src="${assetsPath}/img/toolbar/subtract-minus-remove.svg"><span class="lab">&nbsp; Edges</span></button>
            <button onclick="toggleLive()" title="Toggle live auto-refresh (dashboard mode)" id="live-toggle"><span id="live-dot" class="live-dot"></span><span class="lab">&nbsp; Live</span></button>
            <span id="live-status" class="live-status"></span>
            <span id="health-summary" class="health-summary"></span>
      </div>

      <div class="loader"></div>
      <div id="mainview"></div>

      <script>
        init("${iconThemeBase}");
      </script>

    </body>

    </html>`;
}
