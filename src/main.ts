import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import { connect } from "./data/store";
import { reveal } from "./lib/reveal";
import "./styles/main.css";

createApp(App).use(router).directive("reveal", reveal).mount("#app");
connect();
