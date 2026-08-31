/** @type {import("@storybook/react-webpack5").StorybookConfig} */
module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/preset-create-react-app", "@storybook/addon-links"],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  // Components load icons from /img/*, which CRA serves out of public/.
  staticDirs: ["../public"],
};
