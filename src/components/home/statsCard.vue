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
                <LibraryBig />
            </div>
        </div>
    </div>

</template>

<style scoped>
.cardStats {
    background-color: #6B4226;
    width: 300px;
    height: 140px;
    border-radius: 6px;
    color: white;
    padding: 10px;
    display: flex;
    justify-content: space-between;
}

.cardStats h2 {
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


</style>
