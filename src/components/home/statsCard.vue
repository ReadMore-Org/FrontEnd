<script setup>
import { LibraryBig, TicketPlusIcon } from 'lucide-vue-next'
defineProps ({
    titulo: String,
    valor: Number
})
</script>

<template>
    <div class="maior">
        <div class="cardStats">
            <div>
                <h2>{{ titulo }}</h2>
                <h1>{{ valor }}</h1>
            </div>
            <div class="icone">
                <LibraryBig :size="24" />
            </div>
        </div>
    </div>

</template>

<style scoped>
.cardStats {
  background-color: #6B4226;
  width: 100%;
  max-width: 360px;
  min-width: 290px;
  height: 150px;
  border-radius: 10px;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  box-sizing: border-box; 
}
.cardStats h2 {
    font-weight: 500;
    font-weight: 500;
    font-size: 20px;
}

.icone {
    display: flex;
    align-items: flex-end;
}

.cardStats h1 {
    font-weight: 550;
    margin-top: 8px;
    font-size: 40px;
}
@media (max-width: 650px) { 
    div.cardStats {
        width: 130px;
        height: 120px;
    }
    .cardStats h2 {
    font-weight: 500;
    font-weight: 500;
    font-size: 15px;
    width: 100%;
}
.cardStats h1 {
    font-weight: 550;
    margin-top: 8px;
    font-size: 30px;
}
        .icone svg {
        width: 20px; 
        height: 20px; 
    }
}

</style>
