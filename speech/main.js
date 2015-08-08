var reference = [
[
'Товарищи!', 
'С другой стороны', 
'Равным образом',
'Не следует, однако, забывать, что',
'Таким образом',
'Повседневная практика показывает, что',
], [
'реализация намеченых плановых заданий', 
'рамки и место обучения кадров', 
'постоянный количественный рост и сфера нашей активности', 
'сложившаяся структура организации', 
'новая модель организационной деятельности', 
'дальнее развитие различных форм деятельности', 
], [
'играет важную роль в формировании', 
'требует от нас анализа', 
'требует определения и уточнения', 
'способствует подготовке и реализации', 
'обесвечивает широкому кругу (специалистов) участие в формировании', 
'позволяет выполнить важные задания по разработке',    
], [
'существенных финансовых и административных условий', 
'дальнейших напралений развития', 
'системы массового участия', 
'позиций, занимаемых участниками в отношении поставленных задач', 
'новых предложений', 
'направлений прогрессивного развития',     
]

];

function generateText(maxLength) {
    var speechText = '';
    var randIndex = 0;
    var prevIndex = [];
    do {
        for(i=0; i<4;i++) {
            if(i in prevIndex && (prevIndex[i] == randIndex))  {
                console.debug('prev index ', prevIndex[i], 'new generated ', randIndex);
                while(prevIndex[i] == randIndex) {
                    randIndex = Math.floor(Math.random()*6);
                }
            }
            prevIndex[i] = randIndex;
            speechText += ' ' + reference[i][randIndex];
            randIndex = Math.floor(Math.random()*6);
        }
        speechText += '.' + "\n";
    } while (speechText.length < maxLength);

    return speechText;
}

function createSpeech(containerId) {
    var speechDuration = document.getElementById('speechDuration').value;
    maxLength = speechDuration*170;
    document.getElementById(containerId).innerHTML = generateText(maxLength);
}