const API_KEY = 'AIzaSyAlmI_DKaPrhtXv3w0C-LFPmULIwnvhmx8'; // Replace with your API key
let targetLanguage='en';

let pdfDoc = null;
let pageNum = 1;
let numPages = 0;

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const typedArray = new Uint8Array(e.target.result);

            pdfjsLib.getDocument(typedArray).promise.then(pdf => {
                pdfDoc = pdf;
                numPages = pdf.numPages;
                renderPage(pageNum);
                document.getElementById('pageNumber').textContent = `Page ${pageNum} of ${numPages}`;
            });
        };

        reader.readAsArrayBuffer(file);
    }
});

function renderPage(num) {
    pdfDoc.getPage(num).then(page => {
        const scale = 1.5;
        const viewport = page.getViewport({ scale: scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        document.getElementById('pdfViewer').innerHTML = '';
        document.getElementById('pdfViewer').appendChild(canvas);

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        page.render(renderContext);
    });
}

async function extractTextFromPage() {
    return pdfDoc.getPage(pageNum).then(page => {
        return page.getTextContent().then(textContent => {
            let text = '';
            textContent.items.forEach(item => {
                text += item.str + ' ';
            });
            return text;
        });
    });
}

// async function extractAllText() {
//     let fullText = '';
//     for (let i = 1; i <= numPages; i++) {
//         const pageText = await extractTextFromPage(i);
//         fullText += `\n\nPage ${i}:\n${pageText}`;
//     }
//     return fullText;
// }
async function translateText(text) {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            q: text,
            VideoColorSpace:'black',
            target: targetLanguage,
        }),
    });
    if (!response.ok) {
        throw new Error('Network response was not ok.');
    }
    const data = await response.json();
    return data.data.translations[0].translatedText;
}
async function processPDF() {
    if (pdfDoc) {
        const fullText = await extractTextFromPage();
        //  await extractAllText();
        const translatedText = await translateText(fullText);
        displayTranslatedText(translatedText);
    }
}

function displayTranslatedText(text) {
    const translationContainer = document.querySelector('.slider');
    translationContainer.innerText= text;
}

document.getElementById('prevPage').addEventListener('click', function() {
    if (pdfDoc && pageNum > 1) {
        pageNum--;
        renderPage(pageNum);
        document.getElementById('pageNumber').textContent = `Page ${pageNum} of ${numPages}`;
    }
});

document.getElementById('nextPage').addEventListener('click', function() {
    if (pdfDoc && pageNum < numPages) {
        pageNum++;
        renderPage(pageNum);
        document.getElementById('pageNumber').textContent = `Page ${pageNum} of ${numPages}`;
    }
});


document.getElementById('translateButton').addEventListener('click', async function() {
     processPDF();     
     targetLanguage=document.getElementById('languages').value;
     console.log(targetLanguage);
});

document.getElementById('speakButton').addEventListener('click', async function() {
    const text =document.querySelector('.slider').innerText;
    const languageCode ='hi';

    if (text === undefined || text.trim() === '') {
        alert('Please enter text to convert to speech.');
        return;
    }

    try {
        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: { text },
                voice: { languageCode, ssmlGender: 'NEUTRAL' },
                audioConfig: { audioEncoding: 'MP3',
                pitch:1,
                speakingRate:1, 
                 }
            }),
        });

        if (response.ok) {
            const data = await response.json();
            const audioUrl = URL.createObjectURL(new Blob([new Uint8Array(atob(data.audioContent).split("").map(char => char.charCodeAt(0)))]));
            const audioPlayer = document.getElementById('audioPlayer');
            audioPlayer.src = audioUrl;
            audioPlayer.play();
        } else {
            alert('Error converting text to speech.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error converting text to speech.');
    }
});




















