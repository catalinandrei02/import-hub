import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import { connect } from "./data/store";
import "./styles/main.css";

createApp(App).use(router).mount("#app");
connect();
