//インスタンスの型
type inputJsonType = {
  instances: instanceType[];
};

type instanceType = {
  name: string;
  [key: string]: string | boolean | instanceType[] | undefined;
  nestedInstances?: instanceType[];
};

type setInstancePropertyType = { [key: string]: string | boolean };
