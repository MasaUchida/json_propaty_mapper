const opsions = { width: 320, height: 320 };
figma.showUI(__html__, opsions);

//フォント読み込み
const fontLoader = async () => {
  await figma
    .loadFontAsync({
      family: "Noto Sans JP",
      style: "Regular",
    })
    .catch((err) => {
      console.log(err);
    });
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
 * @param  targetInstance - 対象のインスタンス
 * @returns string[] instancePropertyIds - プロパティのid付きstring配列を返却 ["hoge#0:0" , "fuga#0:0"]
 */
const getInstancePropertyIds = (targetInstance: InstanceNode) => {
  const instancePropertyIds = Object.keys(targetInstance.componentProperties);
  return instancePropertyIds;
};

/**
 * プロパティのidを入れるとプロパティ名にして返してくれる関数
 * @param propetryId
 * @returns propertyName
 */
const getPropertyName = (propertyId: string) => {
  const propertyName = propertyId.substring(0, propertyId.lastIndexOf("#"));
  return propertyName;
};

/**
 * id付きkeyとpropertyを入力してpropertyとvalueでできたオブジェクトを返却する
 * @param propetryId
 * @param instancePropertys
 * @returns object - {"hoge#0:0":"hogehoge"}
 */
const makeSettingObject = (propetryId: string, instanceProperties: any) => {
  const outputObject: setInstancePropertyType = {};

  //keyからid部分(#0:0)をカット
  const propertyName = getPropertyName(propetryId);

  //{"hoge#0:0" : "hogehoge"}を作成
  if (
    typeof instanceProperties[propertyName] === "string" ||
    typeof instanceProperties[propertyName] === "boolean"
  ) {
    outputObject[propetryId] = instanceProperties[propertyName];
  }

  return outputObject;
};

const makeInstancesFromJson = (
  masterComponent: ComponentNode,
  inputJson: inputJsonType
) => {
  const instancesArray: instanceType[] = inputJson.instances;

  instancesArray.forEach((instance) => {
    const { name, nestedInstances, ...proprties } = instance;

    //インスタンスを作成
    const newInstance = masterComponent.createInstance();

    //レイヤー名をつける
    newInstance.name = name;

    //インスタンスのプロパティのidの配列を取得
    const ids = getInstancePropertyIds(newInstance);

    ids.forEach((id) => {
      //setに必要な形にオブジェクトを整形
      const settingObject = makeSettingObject(id, proprties);

      //インスタンスにセット
      if (typeof settingObject !== "undefined") {
        newInstance.setProperties(settingObject);
      }
    });
  });
};

figma.ui.onmessage = (msg) => {
  if (msg.type === "throw-json") {
    const nodes = figma.currentPage.selection;
    let json: inputJsonType;

    //jsonの記述に問題がないかの判定
    if (nodes.length) {
      try {
        if (msg.pureInput !== null && msg.pureInput !== undefined) {
          json = JSON.parse(msg.pureInput);
          figma.ui.postMessage("success");
        }
      } catch (e) {
        console.log(e);
        figma.ui.postMessage("error");
      }

      ////main////
      nodes.forEach((node) => {
        if (node.type === "INSTANCE") {
          const mainComponent = node.mainComponent;

          console.log("json", json);

          const ids = getInstancePropertyIds(node);
          console.log("インスタンスのid", ids);

          if (msg.pureInput !== "" && mainComponent !== null) {
            makeInstancesFromJson(mainComponent, json);
          }
        }

        if (node.type === "COMPONENT") {
          if (msg.pureInput !== "") {
            makeInstancesFromJson(node, json);
          }
        }
      });
    }

    //テキストオブジェクト作成開始
    fontLoader().then(() => {
      textObjectCreate(msg.pureInput);
    });
  }
  if (msg.type === "get-property") {
    const nodes = figma.currentPage.selection;

    nodes.forEach((node) => {
      if (node.type === "INSTANCE") {
        const ids = getInstancePropertyIds(node);

        ids.forEach((id) => {
          const propertyName = getPropertyName(id);
          console.log(propertyName);
        });
      }

      if (node.type === "COMPONENT") {
      }
    });
    console.log("プロパティ取得！");
  }
};
