function openCvReady() {
    cv['onRuntimeInitialized'] = () => {
        let video = document.getElementById("cam_input"); // Video tag
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then(function (stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function (err) {
                console.log("An error occurred! " + err);
            });

        let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
        let gray = new cv.Mat();
        let cap = new cv.VideoCapture(video);
        let faces = new cv.RectVector();
        let classifier = new cv.CascadeClassifier();
        let utils = new Utils('errorMessage');
        let faceCascadeFile = 'haarcascade_frontalface_default.xml'; // Path XML

        utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
            classifier.load(faceCascadeFile); // Load cascade setelah file tersedia
        });

        const FPS = 24;

        function processVideo() {
            let begin = Date.now();
            cap.read(src);
            src.copyTo(dst);
            cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
            try {
                classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
                console.log("Jumlah wajah terdeteksi: ", faces.size());
            } catch (err) {
                console.log("Error dalam deteksi wajah: ", err);
            }

            for (let i = 0; i < faces.size(); ++i) {
                let face = faces.get(i);
                let point1 = new cv.Point(face.x, face.y);
                let point2 = new cv.Point(face.x + face.width, face.y + face.height);
                cv.rectangle(dst, point1, point2, [255, 0, 0, 255]); // Kotak merah
            }

            cv.imshow("canvas_output", dst);

            src.delete();
            dst.delete();
            gray.delete();
            faces.delete();

            // Schedule frame berikutnya
            let delay = 1000 / FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
        }

        // Jalankan proses video pertama kali
        setTimeout(processVideo, 0);
    };
}
