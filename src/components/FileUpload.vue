<template>
  <div class="file-upload-container">
    <h2>Upload an Image</h2>
    
    <FileUpload 
      mode="advanced" 
      name="image" 
      accept="image/*" 
      :maxFileSize="2000000" 
      @select="handleFileSelect"
      @clear="clearImage"
    />

    <!-- Image Preview -->
    <div v-if="previewImage" class="preview">
      <h3>Preview:</h3>
      <img :src="previewImage" alt="Uploaded Image" />
    </div>
  </div>
</template>

<script>
import FileUpload from "primevue/fileupload";

export default {
  components: { FileUpload },
  data() {
    return {
      previewImage: null, // Stores the image preview URL
    };
  },
  methods: {
    handleFileSelect(event) {
      const file = event.files[0];
      if (file) {
        this.previewImage = URL.createObjectURL(file);
      }
    },
    clearImage() {
      this.previewImage = null;
    }
  }
};
</script>

<style scoped>
.file-upload-container {
  text-align: center;
  padding: 20px;
}

.preview img {
  max-width: 100%;
  height: auto;
  margin-top: 10px;
  border-radius: 8px;
}
</style>
