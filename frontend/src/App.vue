<script setup>
import { ref, onMounted } from 'vue'

const title = ref('')
const response = ref('')
const scripts = ref([])
const content = ref('')
const selectedScript = ref(null)

onMounted(async () => {
  const res = await fetch('http://127.0.0.1:8000/scripts')
  scripts.value = await res.json()
})

async function sendToBackend() {
  
  const res = await fetch('http://127.0.0.1:8000/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: title.value, content: content.value })
  })

  const data = await res.json()
  response.value = data.message
  title.value = ''

  
  const scriptsRes = await fetch(
    'http://127.0.0.1:8000/scripts'
  )
  scripts.value = await scriptsRes.json()
}
</script>

<template>
  <div style="padding: 20px">
    <h2>Script Upload Test</h2>
    <input
    v-model="title"
  placeholder="Script title"
/>
    <textarea
     v-model="content" 
     placeholder="Place script here..."
    ></textarea>
    <button @click="sendToBackend">Send</button>

    <p>Backend response: {{ response }}</p>

    <h3>Scripts</h3>

    <ul>
      <li
  v-for="script in scripts"
  :key="script.id"
  @click="selectedScript = script"
>
  {{ script.title }}
    </li>
    </ul>
   <div v-if="selectedScript">
      <h3>{{ selectedScript.title }}</h3>
      <pre>{{ selectedScript.content }}</pre>
  </div>
  </div>
</template>