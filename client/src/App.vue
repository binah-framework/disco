<template>
  <div id="app">
    <header>
      <navbar />
    </header>
    <router-view />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import Navbar from "@/components/Navbar.vue";
import router from "@/router";
import store from "@/store";
import ApiService from "@/services/api";

@Component({
  store,
  router,
  components: { Navbar }
})
export default class App extends Vue {
  created() {
    window.addEventListener("unload", function logData() {
      ApiService.sendBeacon();
    });
  }
}
</script>

<style lang="scss">
// Use the same blue and gray used by Jitsi.
$blue: #0376da !default;
$primary: $blue !default;
$dark: rgb(71, 71, 71) !default;

@import "~bootstrap/scss/bootstrap";
@import "~bootstrap-vue/src/index.scss";
@import "~handsontable/dist/handsontable.full.css";

// :root {
//   --font-family-sans-serif: -apple-system, BlinkMacSystemFont, "Segoe UI",
//     Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji",
//     "Segoe UI Emoji", "Segoe UI Symbol";
// }
html,
body {
  height: 100%;
}

body {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol" !important;
  // font: 1rem/1.5 var(--font-family-sans-serif) !important;
}

#app {
  width: 100%;
  height: 100%;
}
</style>
