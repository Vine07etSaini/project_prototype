const API_KEY = 'AIzaSyAlmI_DKaPrhtXv3w0C-LFPmULIwnvhmx8'; // Replace with your API key
let  data;
document.getElementById('urlButton').addEventListener('click', async function() {
    const url = document.getElementById('url-string').value; 
    if (url === undefined || url === '') {
        alert('Please provide the Article Link.');
        return;
    }
    try{
      const response= await fetch('http://172.105.61.23:9000/translation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: url }),
            mode:"cors"
       })
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      data=json.summary;
      document.getElementById('container').textContent=data;
    } catch (error) {
      console.error(error.message);
    }
});
document.getElementById('translateButton').addEventListener('click', async function() {
           const targetLanguage =document.getElementById('targetLanguage').value;
           if (data === undefined || data.trim() === '') {
            alert('Please provide the Article Link.');
            return;
        }
           document.getElementById('container').innerText= await translateText(data,targetLanguage);   
});
async function translateText(text,targetLanguage) {
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
document.getElementById('speakButton').addEventListener('click', async function() {
  const text =document.getElementById('container').innerText;
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
