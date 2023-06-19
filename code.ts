const opsions = { width: 320, height: 320 };
figma.showUI(__html__, opsions);

//インスタンスの型
type instanceType = {
  name: string;
  [key: string]: string | boolean;
};

type instanceValue = Omit<instanceType, "name">;

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

/**
 * インスタンスを放り込むと、放り込んだインスタンスのプロパティのid付き文字列の配列を返却
 * @param {InstanceNode} targetInstance - 対象のインスタンス
 * @returns {string[]} instancePropertyIds - プロパティのid付きstring配列を返却 ["hoge#0:0" , "fuga#0:0"]
 */
const getInstancePropertyIds = (targetInstance: InstanceNode): string[] => {
  const instancePropertyIds = Object.keys(targetInstance.componentProperties);
  return instancePropertyIds;
};

/**
 * id付きkeyとpropertyのvalueでできたオブジェクトを返却する
 * @param keyWithId
 * @param targetInstance
 * @returns object - {"hoge#0:0":"hogehoge"}
 */
const makeSettingObject = (keyWithId: string, targetInstance: instanceType) => {
  const outputObject: instanceValue = {};

  //keyからid部分(#0:0)をカット
  const valueKey = keyWithId.substring(0, keyWithId.lastIndexOf("#"));

  //{"hoge#0:0" : "hogehoge"}を作成
  outputObject[keyWithId] = targetInstance[valueKey];

  return outputObject;
};

figma.ui.onmessage = (msg) => {
  if (msg.type === "throw-json") {
    const nodes: readonly SceneNode[] = figma.currentPage.selection;
    let json: any;

    //jsonの記述に問題がないかの判定
    if (nodes.length) {
      try {
        json = JSON.parse(msg.pureInput);
        figma.ui.postMessage("success");
      } catch (e) {
        console.log(e);
        figma.ui.postMessage("error");
      }

      ////main////
      nodes.forEach((node) => {
        if (node.type === "COMPONENT") {
          const instancesArray: instanceType[] = json.instances;

          instancesArray.forEach((instance) => {
            //インスタンスを作成
            const newInstance = node.createInstance();

            //インスタンスのプロパティのidの配列を作成
            const ids = getInstancePropertyIds(newInstance);

            //レイヤー名をつける
            newInstance.name = instance.name;

            ids.forEach((id) => {
              //setに必要な形にオブジェクトを整形
              const settingObject = makeSettingObject(id, instance);

              //インスタンスにセット
              newInstance.setProperties(settingObject);
            });
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
