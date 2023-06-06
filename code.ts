const opsions = { width: 320, height: 320 };
//const nodes: SceneNode[] = [];
//nodes.push(jsonText);
//figma.viewport.scrollAndZoomIntoView(nodes);

/*計画
  コンポーネントを選択
  json入れる
  ON
  jsonParce
  コンポーネントからcomponentPropertyDefinitions
  Object.keyでkeyのリストを取り出す(for...in構文でもオブジェクトのkeyだけ取れる)
  そのリストを使ってインスタンスのsetPropertiesを使って値をブっ込む
*/

figma.showUI(__html__, opsions);

//テキストオブジェクトを画面に出す
const textObjectCreate = (json: string) => {
  const jsonText = figma.createText();
  jsonText.fontName = { family: "Noto Sans JP", style: "Regular" };
  jsonText.fontSize = 14;
  jsonText.characters = json;
  figma.currentPage.appendChild(jsonText);
};

//コンポーネントのプロパティのIDを手に入れる
const getComponentPropertysId = (node: any) => {
  const hoge = node.componentPropertyDefinitions;
  console.log(hoge);

  const keys = Object.keys(hoge);
  console.log(`このコンポーネントのキー：${keys}`);
};

figma.ui.onmessage = (msg) => {
  if (msg.type === "throw-json") {
    const nodes: readonly SceneNode[] = figma.currentPage.selection;
    console.log(`nodesの中身:${nodes}`);

    if (nodes.length) {
      nodes.forEach((node) => {
        /*if (node.type === "INSTANCE") {
          console.log(`nodeの${index}番：` + node);
          const hoge = node.componentProperties;
          console.log(hoge);

          node.setProperties({ "title#1:0": "タイトルテストだよ" });
        }*/

        if (node.type === "COMPONENT") {
        }
      });
    }

    try {
      const json = JSON.parse(msg.pureInput);
      console.log(json);
      console.log(figma.currentPage.selection);
      figma.ui.postMessage("success");
    } catch (e) {
      console.log(e);
      figma.ui.postMessage("error");
    }

    //フォント読み込み
    const fontLoader = async () => {
      await figma.loadFontAsync({ family: "Noto Sans JP", style: "Regular" });
    };

    //テキストオブジェクト作成開始
    fontLoader().then(() => {
      textObjectCreate(msg.pureInput);
    });
  }

  //figma.closePlugin();
};
