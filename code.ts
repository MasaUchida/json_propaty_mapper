const opsions = { width: 320, height: 320 };
figma.showUI(__html__, opsions);

figma.ui.onmessage = (msg) => {
  if (msg.type === "throw-json") {
    try {
      const json = JSON.parse(msg.pureInput);
      console.log(json);
      figma.ui.postMessage("success");
    } catch (e) {
      console.log(e);
      figma.ui.postMessage("error");
    }

    //フォント読み込み
    const fontLoader = async () => {
      await figma.loadFontAsync({ family: "Noto Sans JP", style: "Regular" });
    };

    //テキストオブジェクトを画面に出す
    const textObjectCreate = () => {
      const nodes: SceneNode[] = [];

      //
      const jsonText = figma.createText();
      jsonText.fontName = { family: "Noto Sans JP", style: "Regular" };
      jsonText.fontSize = 14;
      jsonText.characters = msg.pureInput;
      nodes.push(jsonText);

      figma.currentPage.appendChild(jsonText);
      figma.viewport.scrollAndZoomIntoView(nodes);
    };

    //テキストオブジェクト作成開始
    fontLoader().then(() => {
      textObjectCreate();
    });

    //figma.currentPage.selection = nodes;
  }

  //figma.closePlugin();
};
