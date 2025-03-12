<template>
  <div class="face-recognition-container">
    <h2>Face Detection</h2>

    <div class="card flex flex-col items-center gap-6">
      <FileUpload
        mode="basic"
        @select="onFileSelect"
        customUpload
        auto
        severity="secondary"
        class="p-button-outlined"
      />
    </div>

    <div class="image-container" v-if="src">
      <div class="preview-wrapper">
        <h3 class="preview-text">Preview:</h3>
        <div class="canvas-wrapper">
          <img
            ref="imageRef"
            v-if="src"
            :src="src"
            alt="Image"
            class="shadow-md rounded-xl w-full sm:w-64"
            @load="detectFaces"
          />
          <canvas ref="canvasRef"></canvas>
        </div>
      </div>
    </div>

    <p v-if="loading">🔄 Analyzing Image...</p>
    <p v-if="faceCount !== null">🟢 Detected Faces: {{ faceCount }}</p>
  </div>
</template>

<script>
import { ref } from "vue";
import FileUpload from "primevue/fileupload";
import * as faceapi from "face-api.js";
import "face-api.js/dist/face-api"; // ✅ Ensures all Face-api.js functions are available

export default {
  components: { FileUpload },
  data() {
    return {
      faceCount: null,
      loading: false,
      src: null,
    };
  },
  async mounted() {
    await this.loadModels();
  },
  methods: {
    onFileSelect(event) {
      const file = event.files[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        this.src = e.target.result;
      };

      reader.readAsDataURL(file);
    },
    async loadModels() {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      } catch (error) {
        console.error("❌ Error loading Face-api.js models", error);
      }
    },

    async detectFaces() {
      this.loading = true;
      this.faceCount = null;

      await this.$nextTick();

      const image = this.$refs.imageRef;
      const canvas = this.$refs.canvasRef;
      const displaySize = { width: image.width, height: image.height };

      canvas.width = displaySize.width;
      canvas.height = displaySize.height;
      try {

        const detections = await faceapi.detectAllFaces(
          image,
          new faceapi.TinyFaceDetectorOptions()
        );

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
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
  },
};
</script>

<style scoped>
.preview-wrapper {
  display: flex;
  flex-direction: column; /* ✅ Stack text above the image */
  align-items: center; /* ✅ Ensures everything is centered */
  margin-bottom: 10px; /* ✅ Adds spacing */
}

.preview-text {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px; /* ✅ Ensures spacing between text & image */
  text-align: center;
}

.face-recognition-container {
  max-width: 800px; /* ✅ Limits width for better layout */
  margin: 40px auto; /* ✅ Centers the whole container */
  text-align: center; /* ✅ Ensures text & content are centered */
  background: #ffffff;
  padding: 20px;
}

.image-container {
  display: flex;
  flex-direction: column; /* ✅ Ensures elements stack vertically */
  align-items: center; /* ✅ Centers everything inside */
  justify-content: center;
  margin-top: 20px;
  width: 100%;
}

.canvas-wrapper {
  position: relative;
  display: flex;
  justify-content: center; /* ✅ Ensures image & canvas are centered */
  align-items: center;
  max-width: 90%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

.image-container img {
  max-width: 90%; /* ✅ Prevents oversized images */
  height: auto;
  display: block;
  border-radius: 8px;
}

canvas {
  max-width: 90%;
  height: auto;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
