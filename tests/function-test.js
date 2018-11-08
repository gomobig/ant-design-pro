const funcA = (param1, param2, ...others) => {
  console.warn(param1);
  console.warn(param2);
  console.warn(others);
};

funcA();
funcA(1, 2, 3, 4);
