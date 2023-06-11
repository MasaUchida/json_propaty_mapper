const opsions = { width: 320, height: 320 };
figma.showUI(__html__, opsions);

//フォント読み込み
const fontLoader = async () => {
  await figma.loadFontAsync({ family: "Noto Sans JP", style: "Regular" });
};

//テキストオブジェクトを画面に出す
const textObjectCreate = (json: string) => {
  const jsonText = figma.createText();
  jsonText.fontName = { family: "Noto Sans JP", style: "Regular" };
  jsonText.fontSize = 16;
  jsonText.characters = json;
  figma.currentPage.appendChild(jsonText);
};

//入力データのキーをインスタンスのpropertyIdデータにすり替える

//なんでも入れられるobjectの型
type objType = {
  [props: string]: any;
};

const swapInputObjectKeyToInstanceId = (
  //改良できそう　毎回配列で返す必要はなさそう　indexをとって、keys[index]にして単発にすれば楽そうだぞ
  data: any[],
  keys: string[]
): objType[] => {
  const output = [];

  for (const obj of data) {
    const transformObject: objType = {};

    for (const key of keys) {
      //keyからid部分(#0:0)をカット
      const property = key.replace(/#.*/, "");
      //objectプロパティの追加
      transformObject[key] = obj[property];
    }

    output.push(transformObject);
  }

  return output;
};

figma.ui.onmessage = (msg) => {
  if (msg.type === "throw-json") {
    const nodes: readonly SceneNode[] = figma.currentPage.selection;
    const json = JSON.parse(msg.pureInput);

    if (nodes.length) {
      try {
        const json = JSON.parse(msg.pureInput);
        figma.ui.postMessage("success");
      } catch (e) {
        console.log(e);
        figma.ui.postMessage("error");
      }

      nodes.forEach((node) => {
        if (node.type === "COMPONENT") {
          const componentArray: any[] = json.components;
          const componentsArrayLength = json.components.length;

          for (let i = 0; i < componentsArrayLength; i++) {
            //インスタンスを作成
            const instance = node.createInstance();

            //レイヤー名をつける
            instance.name = componentArray[i].name;

            //インスタンスのプロパティのidの配列を作成
            const instancePropertyIds = Object.keys(
              instance.componentProperties
            );

            //id配列と入力objectのvalueでsetするobjectを作成
            const setProp = swapInputObjectKeyToInstanceId(
              componentArray,
              instancePropertyIds
            );

            //インスタンスにセット
            instance.setProperties(setProp[i]);
          }
        }
      });
    }

    //テキストオブジェクト作成開始
    fontLoader().then(() => {
      textObjectCreate(msg.pureInput);
    });
  }
};
