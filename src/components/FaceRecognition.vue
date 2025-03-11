<template>
  <div class="face-recognition-container">
    <h2>Face Detection</h2>

    <FileUpload
      mode="advanced"
      name="image"
      accept="image/*"
      :maxFileSize="2000000"
      @select="handleFileUpload"
      @clear="clearImage"
      chooseLabel="📸 Upload Image"
      :auto="true"
      :showUploadButton="false"
    />

    <!-- Image Preview & Canvas -->
    <div class="image-container" v-if="previewImage">
      <h3>Preview:</h3>
      <div class="canvas-wrapper">
        <img
          ref="imageRef"
          :src="previewImage"
          alt="Uploaded Image"
          @load="detectFaces"
        />
        <canvas ref="canvasRef"></canvas>
      </div>
    </div>

    <p v-if="loading">🔄 Analyzing Image...</p>
    <p v-if="faceCount !== null">🟢 Detected Faces: {{ faceCount }}</p>
  </div>
</template>

<script>
import FileUpload from "primevue/fileupload";
import * as faceapi from "face-api.js";
import "face-api.js/dist/face-api"; // ✅ Ensures all Face-api.js functions are available

export default {
  components: { FileUpload },
  data() {
    return {
      previewImage: null, // Stores the image preview URL
      faceCount: null, // Number of detected faces
      loading: false, // Loading state
    };
  },
  async mounted() {
    await this.loadModels();
  },
  methods: {
    async loadModels() {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        console.log("✅ Face-api.js models loaded successfully");
      } catch (error) {
        console.error("❌ Error loading Face-api.js models", error);
      }
    },
    handleFileUpload(event) {
      const file = event.files[0];
      if (file) {
        this.previewImage = URL.createObjectURL(file);
      }
    },
    async detectFaces() {
      this.loading = true;
      this.faceCount = null;

      await this.$nextTick(); // Ensure image is fully loaded

      const image = this.$refs.imageRef;
      const canvas = this.$refs.canvasRef;
      const displaySize = { width: image.width, height: image.height };

      // Resize canvas to match the image
      canvas.width = displaySize.width;
      canvas.height = displaySize.height;

      try {
        // Detect faces using TinyFaceDetector
        const detections = await faceapi.detectAllFaces(
          image,
          new faceapi.TinyFaceDetectorOptions()
        );

        // Resize results for correct scaling
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // ✅ Fix: Manually Draw Bounding Boxes Instead of `drawDetections`
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        resizedDetections.forEach((detection) => {
          const box = detection.box;
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
        });

        this.faceCount = resizedDetections.length;
      } catch (error) {
        console.error("❌ Error detecting faces:", error);
      }

      this.loading = false;
    },
    clearImage() {
      this.previewImage = null;
      this.faceCount = null;
    },
  },
};
</script>

<style scoped>
.face-recognition-container {
  text-align: center;
  padding: 20px;
}

.image-container {
  position: relative;
  display: inline-block;
}

.canvas-wrapper {
  position: relative;
  display: inline-block;
  border: 3px solid #4caf50; /* ✅ Green border */
  border-radius: 10px; /* ✅ Rounded edges */
  overflow: hidden;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2); /* ✅ Adds soft shadow */
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
}

.custom-file-upload {
  transition: all 0.3s ease-in-out;
  border-radius: 8px;
  background-color: #4caf50; /* ✅ Green button */
  color: white;
  font-weight: bold;
  padding: 10px 15px;
}

.image-container {
  opacity: 0;
  transform: scale(0.95);
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
