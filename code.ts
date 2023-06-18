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

//インスタンスの型
type instanceType = {
  name: string;
  [key: string]: string | boolean;
};

type instanceValue = Omit<instanceType, "name">;

figma.ui.onmessage = (msg) => {
  if (msg.type === "throw-json") {
    const nodes: readonly SceneNode[] = figma.currentPage.selection;
    let json: any;

    if (nodes.length) {
      try {
        json = JSON.parse(msg.pureInput);
        figma.ui.postMessage("success");
      } catch (e) {
        console.log(e);
        figma.ui.postMessage("error");
      }

      nodes.forEach((node) => {
        if (node.type === "COMPONENT") {
          const instancesArray: instanceType[] = json.instances;
          const swapedKeyValueObject: instanceValue = {};

          console.log(instancesArray);

          instancesArray.forEach((instance) => {
            //インスタンスを作成
            const newInstance = node.createInstance();

            //インスタンスのプロパティのidの配列を作成
            //instancePropertyIds => ["hoge#0:0" , "fuga#0:0"]
            const instancePropertyIds = Object.keys(
              newInstance.componentProperties
            );

            console.log("instancePropertyIds", instancePropertyIds);

            //レイヤー名をつける
            newInstance.name = instance.name;

            //objectプロパティ {"hoge#0:0":"hogehoge"}を捻り出す
            instancePropertyIds.forEach((keyWithId) => {
              //keyからid部分(#0:0)をカット
              const valueKey = keyWithId.substring(
                0,
                keyWithId.lastIndexOf("#")
              );

              //instancePropertyIdsをkeyにする
              //このkeyからID部分を無くしたものをkeyにしてinstanceからvalueを呼び出す
              swapedKeyValueObject[keyWithId] = instance[valueKey];
            });

            //インスタンスにセット {"hoge#0:0":"内容"}
            newInstance.setProperties(swapedKeyValueObject);
          });
        }
      });
    }

    //テキストオブジェクト作成開始
    fontLoader().then(() => {
      textObjectCreate(msg.pureInput);
    });
  }
};
