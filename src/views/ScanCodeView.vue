<script setup>
import { onMounted } from 'vue'
import { Html5QrcodeScanner } from 'html5-qrcode'

onMounted(() => {
  const scanner = new Html5QrcodeScanner(
    "reader",
    {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    },
    false
  )

  scanner.render(success, error)
})

function success(decodedText) {
  console.log("Código lido:", decodedText)
}

function error(err) {
  console.log(err)
}
</script>
<template>
  <div id="reader"></div>
</template>
<style scoped>
</style>

