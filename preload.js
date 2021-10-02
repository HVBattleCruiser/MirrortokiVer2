// All of the Node.js APIs are available in the preload process.

const { prev } = require('cheerio/lib/api/traversing');
const { y } = require('pdfkit');
const { decode } = require('punycode');

//const
const fs = require('fs');

// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {

//txt 불러오기
/*
const article = fs.readFileSync("source.txt");
lineArray = article.toString().split('\r\n');
console.log(lineArray);
*/

//최근 만화 불러오기
var recentTitle = fs.readFileSync("./txtdb/recentTitle.txt").toString().split('\n');
var recentLink = fs.readFileSync("./txtdb/recentLink.txt").toString().split('\n');

//이전 돌아가기
var previousFunction = [];

//만화 선택창 보여?
var showMangaSelector = false;

//이미지 넣기
function putImage(targetImg, imgPath){
    const nativeImage = require('electron').nativeImage
    let imgsrc = nativeImage.createFromPath(imgPath);
    document.querySelector("img"+targetImg).src = imgsrc.toDataURL();
}

//로딩넣기
function putImageLoading(){
    document.querySelector("div.main").innerHTML = '<img style="width:100%;max-width:500px"; id="img" src="">';
    putImage("#img",'./img/loading.png');
}

//이전으로 돌아가는 함수
function gotoPreviousFunction(){
    if(previousFunction.length < 2){
        console.log("cant't do that");
    }
    else{
    document.querySelector("div.selector-mangalist").style.display = "none";
    showMangaSelector = false;
    previousFunction = previousFunction.slice(0,-1);
    eval(previousFunction[previousFunction.length-1])
    previousFunction = previousFunction.slice(0,-1);
    }
}

//새로고침 함수
function refreshFunction(){
    if(previousFunction.length < 1){
        console.log("cant't do that");
    }
    else{
    document.querySelector("div.selector-mangalist").style.display = "none";
    showMangaSelector = false;
    eval(previousFunction[previousFunction.length-1])
    }
}


//초기링크
var link = fs.readFileSync("./txtdb/link.txt").toString().split('\r\n')[0];
console.log(link);
var currentPage = 1;



//업데이트 보이기
function updateView(page){
    //사이드 초기화
    document.querySelector(".side_list").innerHTML = '';
    document.querySelector(".control_bar").innerHTML = '';
    putImageLoading();
    var cheerio = require('cheerio');
    var request = require('request');
    var listurl = 'https://'+link+'/bbs/page.php?hid=update&page='+String(page);
    request(listurl, function(error, response, html){
        if (error) {alert("사이트가 불러와지지 않았습니다. 새로고침 해주세요.")};
    
        var $ = cheerio.load(html);
        
        $('span.count').remove();
        $('i').remove();
        //메인 만화 제목
        var mainMangaTitles = $('div.post-subject').find('a').text().replace(/\n/g,'').replace(/\r/g,'').split(/\s\s\s/).slice(0,-1);

        //만화 링크
        var mainMangaLinks = [];
        $('div.post-subject').find('a').each((index,element) => {
            mainMangaLinks.push($(element).attr('href'));
        }
        );

        //만화 업데이트 시각
        var mainMangaUpdateTimes = [];
        $('span.txt-normal').each((index,element) => {
            mainMangaUpdateTimes.push($(element).text());
        }
        );

        //작가
        var mainMangaCurlie = [];
        $('div.post-text').each((index,element) => {
            mainMangaCurlie.push($(element).text().replace(/\s\s\n\s(.*)/g,'').replace(/\n\s/g,''));
        }
        );

        //표지 이미지
        var mainMangaImages = [];
        $('div.img-item').find('img').each((index,element) => {
            mainMangaImages.push($(element).attr('src'));
        }
        );
        
        //목록 링크
        var mainMangaListLinks = [];
        $('a.btn.btn-xs.btn-primary').each((index,element) => {
            mainMangaListLinks.push($(element).attr('href'));
        }
        );

        //html 수정
        if(mainMangaListLinks[0] == undefined){
            alert("사이트가 불러와지지 않았습니다.. 새로고침 해주세요.");
        }
        else{
        document.querySelector("div.main").innerHTML = '';
        for(i = 0;i<70;i=i+1){
            document.querySelector("div.main").innerHTML += 
            '<div class="main_text">'+
            '<div class="img-container">'+
            '<img src="'+mainMangaImages[i]+'" class="main-image">'+
            '</div>'+
            '<div class="main-title">'+'<strong id="'+mainMangaLinks[i]+'" class="main-manga-link">'+mainMangaTitles[i]+'</strong></div>'+
            '<div class="main-button-and-date">'+'<button type="button" class="main-list-button" id="'+mainMangaListLinks[i]+'">목록보기</button>'+'<br>'+
            '<span style="font-size:12px" class="update-date">'+mainMangaUpdateTimes[i]+'</span>'+
            '<br><span style="font-size:10px" class="curlie">'+mainMangaCurlie[i]+'</span>'+'</div>'+
            '</div>';
        }
        
        //해당 만화로 이동
        document.querySelectorAll(".main-manga-link").forEach(thisLink =>
            thisLink.addEventListener("click", () => mangaView(thisLink.id))
        );
        
        //해당 링크로 이동
        document.querySelectorAll(".main-list-button").forEach(thisLink =>
            thisLink.addEventListener("click", () => listView(thisLink.id))
        );

        //작은 창 이전페이지 다음페이지
        document.querySelector(".control_bar").innerHTML = 
        '<button style="width:30px;height:30px;margin-top:5px;margin-right:20px" id="previousPage">◁</button>'+        
        '<select name="page" id="selectPage_small" style="display:inline-block"><option value="10" id="page_small10">10페이지</option><option value="9" id="page_small9">9페이지</option><option value="8" id="page_small8">8페이지</option><option value="7" id="page_small7">7페이지</option><option value="6" id="page_small6">6페이지</option><option value="5" id="page_small5">5페이지</option><option value="4" id="page_small4">4페이지</option><option value="3" id="page_small3">3페이지</option><option value="2" id="page_small2">2페이지</option><option value="1" id="page_small1">1페이지</option></select>'+
        '<button style="width:30px;height:30px;margin-top:5px;margin-left:20px" id="nextPage">▷</button>';

        //큰 창 이전페이지 다음페이지
        document.querySelector(".side_list").innerHTML =
        '<div style="width:100%;height:40px;outline:1px solid black;text-align:center;">'+
        '<button style="width:30px;height:30px;margin-top:5px;margin-right:20px" id="previousPage">◁</button>'+        
        '<select name="page" id="selectPage_big" style="display:inline-block"><option value="10" id="page_big10">10페이지</option><option value="9" id="page_big9">9페이지</option><option value="8" id="page_big8">8페이지</option><option value="7" id="page_big7">7페이지</option><option value="6" id="page_big6">6페이지</option><option value="5" id="page_big5">5페이지</option><option value="4" id="page_big4">4페이지</option><option value="3" id="page_big3">3페이지</option><option value="2" id="page_big2">2페이지</option><option value="1" id="page_big1">1페이지</option></select>'+
        '<button style="width:30px;height:30px;margin-top:5px;margin-left:20px" id="nextPage">▷</button>'+
        '</div>';
        document.querySelector('#page_small'+String(currentPage)).selected = "selected";
        document.querySelector('#selectPage_small').addEventListener("change", () =>
        {currentPage = Number(document.querySelector('#selectPage_small').value);
        updateView(currentPage);
        console.log(currentPage)});

        document.querySelector('#page_big'+String(currentPage)).selected = "selected";
        document.querySelector('#selectPage_big').addEventListener("change", () =>
        {currentPage = Number(document.querySelector('#selectPage_big').value);
        updateView(currentPage);
        console.log(currentPage)});
        
        
        //이전페이지 다음페이지 버튼
        document.querySelectorAll("#previousPage").forEach(thisbutton =>
            thisbutton.addEventListener("click", previousPage));
        document.querySelectorAll("#nextPage").forEach(thisbutton =>
            thisbutton.addEventListener("click", nextPage));            

        //이전페이지 다음페이지
        function previousPage(){
            if(currentPage > 1){
                currentPage = currentPage-1;
                updateView(currentPage);
                console.log(currentPage)}
            else{
                alert("이전 페이지가 없습니다");
            }
        };
        function nextPage(){
            if(currentPage < 10){
                currentPage = currentPage+1;
                updateView(currentPage);
                console.log(currentPage)
            }
            else{
                alert("다음 페이지가 없습니다");
            }
        };
        
        //이전 돌아가기
        previousFunction.push("updateView("+String(currentPage)+")");
        for(i=0;i<previousFunction.length-1;i++){
            if(previousFunction[i] == previousFunction[i+1]){
            previousFunction.splice(i,1);
            }
            }
    }
    });
    //사이드 초기화(임시)
    //만화 선택창 없애기
    document.querySelector("div.selector-mangalist").style.display = "none";
    showMangaSelector = false;
};


//만화 보기
function mangaView(mangaurl){
//사이드 초기화
document.querySelector(".side_list").innerHTML = '';
document.querySelector(".control_bar").innerHTML = '';
putImageLoading();
var cheerio = require('cheerio');
var request = require('request');

request(mangaurl, function(error, response, html){
    if (error) {throw error};

    var $ = require('cheerio')
    var parsedHTML = $.load(html)

    var source1;
    source1 = parsedHTML('script').get()[28].children[0].data.replace(/\n/g, "");
    var source2 = source1.replace(/\r/g, "");
    var source3 = source2.replace(/\s+/, "");
    var source4 = source3.replace(/\s+$/g, "");
    var source5 = '<script>'+source4+'</script>';
    var source6 = source5.replace(/<script(.*)varhtml_data\=\'\'/g,"");
    /*var source6 = source5.replace(/<script(.*)varhtml_data\=\'\';/g,"");*/
    var source7 = source6.replace(/html_data\+\=/g,'?');
    var source8 = source7.replace(/\?\'\';(.*)<\/script>/, '');
    var source9 = source8.replace(/\?/g, '');
    var source10 = source9.replace(/\'/g, '');
    var source11 = source10.replace(/\;/g, '');

    function html_encode(s){
        var i=0,out='';l=s.length;for(;i<l;i+=3){out+=String.fromCharCode(parseInt(s.substr(i,2),16));}return(out);
    }



    //제목 얻기
    var mangaTitle = $.load(html)('span.page-desc').text();

    //최근 본 만화에 추가
    for(i=0;i<recentLink.length;i++){
        if(recentTitle[i] == mangaTitle.replace('\n','').slice(0,-1)){
            recentTitle.splice(i,1);
            recentLink.splice(i,1);
        }
    }
    /*recentTitle.unshift(mangaTitle.replace(/\n/,''));
    recentLink.unshift(mangaurl);*/
    recentTitle.unshift(mangaTitle.replace('\n','').slice(0,-1));
    recentLink.unshift(mangaurl.replace('\n',''));
    console.log(recentTitle);
    var recentTitleText = recentTitle[0];
    var recentLinkText = recentLink[0];
    if(recentLink[1] ==- ""){
        recentTitle.splice(1,1);
        recentLink.splice(1,1);
    }
    for(i=1;i<recentLink.length;i++){
        /*recentTitleText.concat('\r\n'+recentTitle[i])
        recentLinkText.concat('\r\n'+recentLink[i])*/
        recentTitleText = recentTitleText.concat('\n',recentTitle[i])
        recentLinkText = recentLinkText.concat('\n',recentLink[i])
    }
    if(recentTitle.length > 50){
        recentTitle.pop();
        recentLink.pop();
    }
    
    recentView();
    
    fs.writeFile('./txtdb/recentTitle.txt', recentTitleText, 'utf8', function(error){});
    fs.writeFile('./txtdb/recentLink.txt', recentLinkText, 'utf8', function(error){});

    

    //목록 제목 얻기
    var mangaListLinks = [];
    $.load(html)('div.toon-nav').find('a').each((index,element) => {
        if($(element).attr('class') == undefined){
            mangaListLinks.push($(element).attr('href'))
        }
        else {}
    });
    var mangaListLink = mangaListLinks[2];

    //이전화 링크
    var prevLink = $.load(html)('div.toon-nav').find('a#goPrevBtn').attr('href');
    //다음화 링크
    var nextLink = $.load(html)('div.toon-nav').find('a#goNextBtn').attr('href');

    //목록 추가하기
    document.querySelector(".control_bar").innerHTML = '';//컨트롤바 초기화
    request(mangaListLink, function(error, response, mangaListLinkHtml){
        if (error) {alert("오류! 새로고침 해주세요")}

        var mangaListLinkHtmlParse = cheerio.load(mangaListLinkHtml);

        //목록 제목
        var listMangaTitle = mangaListLinkHtmlParse('div.col-md-10').find('div.view-content').find('span').find('b').text();
        
        //목록 링크
        var listMangaLinks = [];
        mangaListLinkHtmlParse('div.wr-subject').each((index,element) => {
            listMangaLinks.push($(element).find('a').attr('href'));
        }
        );
        

        //목록 화수 제목
        var listMangaTitles = [];
        mangaListLinkHtmlParse('div.wr-subject').each((index,element) => {
            mangaListLinkHtmlParse('span').remove();
            mangaListLinkHtmlParse('b').remove();
            listMangaTitles.push($(element).find('a').text());
        }
        );

        //첫번째 사이드 넣기
        document.querySelector(".side_list").innerHTML = '';
        document.querySelector(".side_list").innerHTML += '<div class="side-list-manga-title">'+
        '<button class="listname" id="showList">목록 보기</button>'+
        '<div style="width:70%;height:100%;float:left;text-align:center;font-size:0px">'+
        '<button style="width:30px;height:30px;margin-top:4px;font-size:10px;" id="goPrevButton">◁</button>'+
        '<button style="width:60px;height:30px;margin-top:4px;font-size:10px;" id="downloadManga">다운로드</button>'+
        '<button style="width:30px;height:30px;margin-top:4px;font-size:10px;" id="goNextButton">▷</button>'+
        '</div>'+
        '</div>';
        document.querySelector(".side_list").innerHTML += '<div class="side-list-manga-list">'+
        '<div class="side-list-manga-list-list" id="side-list-manga-list">'+
        '</div>'+
        '</div>';
        for(i=0; i < listMangaTitles.length; i = i+1){
            document.querySelector("div#side-list-manga-list").innerHTML +=
            '<div class="manga-list">'+
            '<button class="manga-list-epnumber">'+
            String(listMangaTitles.length-i)+
            '</button>'+
            '<button class="manga-list-title" style="width:calc( 100% - 50px );" id="'+
            listMangaLinks[i]+
            '">'+
            listMangaTitles[i]+
            '</button>'+
            '</div>'
        }

        //작은 화면 컨트롤바
        document.querySelector(".control_bar").innerHTML = '';
        document.querySelector(".control_bar").innerHTML +='<button style="width:30px;height:30px;margin-top:4px;font-size:10px;" id="goPrevButton">◁</button>';
        document.querySelector(".control_bar").innerHTML +='<button id="manga_list_selector" style="width:calc( 100% - 120px );height:30px;margin-top:4px;font-size:10px; white-space: nowrap; text-overflow: ellipsis; overflow:hidden;">'+mangaTitle+'</button>';
        document.querySelector(".control_bar").innerHTML +='<button style="width:30px;height:30px;margin-top:4px;font-size:10px;" id="goNextButton">▷</button>';
        document.querySelector("div.selector-mangalist").innerHTML = '';
        for(i=0; i < listMangaTitles.length; i = i+1){
            document.querySelector("div.selector-mangalist").innerHTML +=
            '<div class="manga-list" style="background-color:white">'+
            '<button class="manga-list-epnumber" style="font-size:10px;background-color:white">'+
            String(listMangaTitles.length-i)+
            '</button>'+
            '<button class="manga-list-title" style="width:calc( 100% - 50px ); font-size:10px;background-color:white" id="'+
            listMangaLinks[i]+
            '">'+
            listMangaTitles[i]+
            '</button>'+
            '</div>'
        }

     
        //마우스 올리면 색 바뀜
        document.querySelectorAll("div.manga-list").forEach(thisdiv =>
            thisdiv.addEventListener("mouseover", () => thisdiv.style.background = "#d1d1d1"));
        document.querySelectorAll("div.manga-list").forEach(thisdiv =>
            thisdiv.addEventListener("mouseleave", () => thisdiv.style.background = "white"));
        //해당 만화로 이동
        document.querySelectorAll(".manga-list-title").forEach(thisLink =>
            thisLink.addEventListener("click", () => mangaView(thisLink.id))
        );
        document.querySelectorAll(".manga-list-title").forEach(thisLink =>
            thisLink.addEventListener("click", () => document.querySelector("div.selector-mangalist").style.display = "none")
        );
        //마우스 설명충
        document.querySelectorAll(".manga-list-title").forEach(thisdiv =>
            thisdiv.addEventListener("mouseover", () => document.querySelector('.explainer').innerText = thisdiv.innerText));
        document.querySelectorAll(".manga-list-title").forEach(thisdiv =>
            thisdiv.addEventListener("mouseover", () => document.querySelector('.explainer').style.display = 'block'));
        document.querySelectorAll(".manga-list-title").forEach(thisdiv =>
            thisdiv.addEventListener("mouseleave", () => document.querySelector('.explainer').style.display = 'none'));
        document.querySelectorAll(".manga-list-title").forEach(thisdiv =>
            thisdiv.addEventListener("click", () => document.querySelector('.explainer').style.display = 'none'));
        //이전화 다음화
        document.querySelectorAll('#goPrevButton').forEach(thisquery =>
            thisquery.addEventListener("click", goPrev));
        document.querySelectorAll('#goNextButton').forEach(thisquery =>
            thisquery.addEventListener("click", goNext))
        function goPrev(){
            if(prevLink == "#prev"){
                alert('이전화가 없습니다.');
            }
            else{
                mangaView(prevLink);
                document.querySelector("div.selector-mangalist").style.display = "none";
                showMangaSelector = false; 
                document.querySelector(".control_bar").innerHTML = '';
                document.querySelector(".side-list-manga-title").innerHTML = '';
                
            }
        }
        function goNext(){
            if(nextLink == "#next"){
                alert('다음화가 없습니다.');
            }
            else{
                mangaView(nextLink);
                document.querySelector("div.selector-mangalist").style.display = "none";
                showMangaSelector = false;  
                document.querySelector(".control_bar").innerHTML = '';
                document.querySelector(".side-list-manga-title").innerHTML = '';
                
            }
            
        }

        //리스트 버튼
        document.querySelector("#manga_list_selector").addEventListener("click", showMangaList);
        function showMangaList(){
            if(document.querySelector("div.selector-mangalist").style.display == "none")
            {document.querySelector("div.selector-mangalist").style.display = "block";
            showMangaSelector = true;}
            else{
            document.querySelector("div.selector-mangalist").style.display = "none";
            showMangaSelector = false;
            }
            document.querySelector("div.selector-mangalist").style.width = document.querySelector("#manga_list_selector").style.width;
        }
        document.querySelector("#manga_list_selector").addEventListener("click", moveExplainerToThis);
        function moveExplainerToThis(){
            var xCoordinate = window.pageXOffset + document.querySelector("#manga_list_selector").getBoundingClientRect().left;
            var yCoordinate = window.pageYOffset + document.querySelector("#manga_list_selector").getBoundingClientRect().top;
            document.querySelector("div.selector-mangalist").style.left = xCoordinate - 5 + 'px';
            document.querySelector("div.selector-mangalist").style.top = yCoordinate - document.querySelector("div.selector-mangalist").offsetHeight + 'px';
        }
        
        //이미지 다운로드        
        document.querySelector("#downloadManga").addEventListener("click", downloadAllImg);
        function downloadAllImg(){
        if(!fs.existsSync('./download/'+listMangaTitle.replace(/\n/g,''))){
            fs.mkdirSync('./download/'+listMangaTitle.replace(/\n/g,''))
        }
        if(!fs.existsSync('./download/'+listMangaTitle.replace(/\n/g,'')+'/'+mangaTitle.replace(/\n/g,'').replace(/\r/g,'').replace(/\s+$/g, ""))){
            fs.mkdirSync('./download/'+listMangaTitle.replace(/\n/g,'')+'/'+mangaTitle.replace(/\n/g,'').replace(/\r/g,'').replace(/\s+$/g, ""))
        }
        alert("이미지 총"+mangaImgSources.length+"장")
        var downloadedImg = [];
        for(i=0;i<mangaImgSources.length;i=i+1){
            downloadImg(mangaImgSources[i],'./download/'+listMangaTitle.replace(/\n/g,'')+'/'+mangaTitle.replace(/\n/g,'').replace(/\r/g,'').replace(/\s+$/g, "")+'/'+(i+1)+'.jpg',downloadedImg,mangaImgSources)
        }
        }
        //이미지 다운받기 함수
        function downloadImg(file_url , targetPath, downloadedImg, mangaImgSources){

            var request = require('request');
            // Save variable to know progress
            var received_bytes = 0;
            var total_bytes = 0;
        
            var req = request({
                method: 'GET',
                uri: file_url
            });
        
            var out = fs.createWriteStream(targetPath);
            req.pipe(out);
        
            req.on('response', function ( data ) {
                // Change the total bytes value to get progress later.
                total_bytes = parseInt(data.headers['content-length' ]);
            });
        
            req.on('end', function() {
                /*alert("File succesfully downloaded("+(i+1)+')');*/
                downloadedImg.push("a");
                if(downloadedImg.length == mangaImgSources.length){
                    alert("다운로드 완료!");
                    createPDF();
                }
            });
        }
        //pdf 생성
        function createPDF(){
            const imgToPDF = require('image-to-pdf');
            var pages = [];
            for(i=0;i<mangaImgSources.length;i=i+1){
                pages.push('./download/'+listMangaTitle.replace(/\n/g,'')+'/'+mangaTitle.replace(/\n/g,'').replace(/\r/g,'').replace(/\s+$/g, "")+'/'+(i+1)+'.jpg');
            }
        imgToPDF(pages, 'A4')
            .pipe(fs.createWriteStream('./download/'+listMangaTitle.replace(/\n/g,'')+'/'+mangaTitle.replace(/\n/g,'').replace(/\r/g,'').replace(/\s+$/g, "")+'.pdf'));            
        }
    });

    //본문 html 넣기
    if(source11 == undefined){
        alert("사이트가 불러와지지 않았습니다.. 새로고침 해주세요.");
    }
    else{
    var unEncodedImgSource = (html_encode(source11));
    var unEncodedImgSourceNoLoadingGif = unEncodedImgSource.replace(/\/img\/loading-image.gif" data-...........="/g, '');

    //html 표시
    document.querySelector(".main").innerHTML = '<style>'+parsedHTML('style').get()[10].children[0].data+'</style>'+'<button class="manga-title">'+mangaTitle+'</button><hr width="100%" color="black" size="6px" style="margin-top:0px">'+unEncodedImgSourceNoLoadingGif;

    //이미지 소스 추출
    var decodedImgSource = $.load(unEncodedImgSourceNoLoadingGif);

    var imgClasses = [];
    decodedImgSource('p').each((index,element) => {
        if($(element).attr('class') == undefined){}
        else{
        imgClasses.push($(element).attr('class'));
        }
    }
    );
    
    for(i=0; i<imgClasses.length; i=i+1){
        decodedImgSource('p.'+imgClasses[i]).remove();
    }

    var mangaImgSources = [];//이미지 소스
    decodedImgSource('p').each((index,element) => {
        mangaImgSources.push($(element).find('img').attr('src'));
    }
    );

    if(mangaImgSources.length == 0){
        decodedImgSource('div').find('img').each((index,element) => {
            mangaImgSources.push($(element).attr('src'));
        });
    }

    



    //이전 돌아가기
    previousFunction.push('mangaView("'+mangaurl+'")');
    for(i=0;i<previousFunction.length-1;i++){
        if(previousFunction[i] == previousFunction[i+1]){
        previousFunction.splice(i,1);
        }
        }
    
    }

});
}




//목록 보기
function listView(listurl){
    //사이드 초기화
    document.querySelector(".side_list").innerHTML = '';
    document.querySelector(".control_bar").innerHTML = '';
    putImageLoading();
    var cheerio = require('cheerio');
    var request = require('request');
    request(listurl, function(error, response, html){
        if (error) {throw error};
    
        var $ = cheerio.load(html);
        
        
        //업데이트 날짜
        var listMangaUpdateTimes = [];
        $('div.wr-date').each((index,element) => {
            listMangaUpdateTimes.push($(element).html().replace(/\n/g, ' '));
        }
        );
        
        //목록 제목
        var listMangaTitle = $('div.col-md-10').find('div.view-content').find('span').find('b').text();
        
        //목록 정보
        var listMangaData = [];
        $('div.col-md-10').find('a').each((index,element) => {
            listMangaData.push($(element).text());
        }
        );
        //작가, 장르, 연재

        //목록 이미지
        var listMangaImage = $('div.view-img').find('img').attr('src');

        //목록 링크
        var listMangaLinks = [];
        $('div.wr-subject').each((index,element) => {
            listMangaLinks.push($(element).find('a').attr('href'));
        }
        );

        //목록 화수 제목
        var listMangaTitles = [];
        $('div.wr-subject').each((index,element) => {
            $('span').remove();
            $('b').remove();
            listMangaTitles.push($(element).find('a').text());
        }
        );



        if(listMangaTitles[0] == undefined){
            alert("사이트가 불러와지지 않았습니다.. 새로고침 해주세요.");
        }
        else{
        //내부 수정
        document.querySelector("div.main").innerHTML = '';
        document.querySelector("div.main").innerHTML += 
            '<span style="font-size:20px">'+listMangaTitle+'</span>'+
            '<hr width="100%" color="black" size="6px">';
        for(i=0; i < listMangaTitles.length; i = i+1){
            document.querySelector("div.main").innerHTML +=
            '<div class="manga-list">'+
            '<button class="manga-list-epnumber">'+
            String(listMangaTitles.length-i)+
            '</button>'+
            '<button class="manga-list-title" id="'+
            listMangaLinks[i]+
            '">'+
            listMangaTitles[i]+
            '</button>'+
            '<button class="manga-list-date">'+
            listMangaUpdateTimes[i]+
            '</button>'+
            '</div>'
        }

        //마우스 올리면 색 바뀜
        document.querySelectorAll("div.manga-list").forEach(thisdiv =>
            thisdiv.addEventListener("mouseover", () => thisdiv.style.background = "#d1d1d1"));
        document.querySelectorAll("div.manga-list").forEach(thisdiv =>
            thisdiv.addEventListener("mouseleave", () => thisdiv.style.background = "white"));
        //해당 만화로 이동
        document.querySelectorAll(".manga-list-title").forEach(thisLink =>
            thisLink.addEventListener("click", () => mangaView(thisLink.id))
        );
        //마우스 설명충
        document.querySelectorAll(".manga-list-title").forEach(thisdiv =>
            thisdiv.addEventListener("mouseover", () => document.querySelector('.explainer').innerText = thisdiv.innerText));
        document.querySelectorAll(".manga-list-title").forEach(thisdiv =>
            thisdiv.addEventListener("mouseover", () => document.querySelector('.explainer').style.display = 'block'));
        document.querySelectorAll(".manga-list-title").forEach(thisdiv =>
            thisdiv.addEventListener("mouseleave", () => document.querySelector('.explainer').style.display = 'none'));
        document.querySelectorAll(".manga-list-title").forEach(thisLink =>
            thisLink.addEventListener("click", () => document.querySelector('.explainer').style.display = 'none'))
        }
        //이전으로 돌아가기
        previousFunction.push('listView("'+listurl+'")');
        for(i=0;i<previousFunction.length-1;i++){
            if(previousFunction[i] == previousFunction[i+1]){
            previousFunction.splice(i,1);
            }
            }
        
    });
    //사이드 초기화(임시)
    document.querySelector(".side_list").innerHTML = '';
    document.querySelector(".control_bar").innerHTML = '';
    //만화 선택창 없애기
    document.querySelector("div.selector-mangalist").style.display = "none";
    showMangaSelector = false;

}


//북마크, 최근에 본 만화
document.querySelector(".side_new").innerHTML = '<div style="width:calc( 100% - 2px );height:38px;border:1px solid black;">'+
'<button id="showBookmarks" style="width:50%;height:100%">🔖북마크</button>'+
'<button id="showRecents" style="width:50%;height:100%">최근 기록</button>'+
'</div>'+
'<div class="side-list-manga-list" id="okok">'+
'</div>';
document.querySelector("#showRecents").addEventListener("click", recentView);


//최근에 본 만화

recentView();
function recentView(){
    //
    document.querySelector("#okok").innerHTML = 
    '<div class="side-list-manga-list-list" id="side-list-manga-recent">'+
    '</div>';
    document.querySelector("div#side-list-manga-recent").innerHTML = '';
    for(i=0; i < recentTitle.length; i = i+1){
        document.querySelector("div#side-list-manga-recent").innerHTML +=
        '<div class="manga-list">'+
        '<button class="manga-list-epnumber">'+
        String(recentTitle.length-i)+
        '</button>'+
        '<button class="manga-list-title" style="width:calc( 100% - 50px );" id="'+
        recentLink[i]+
        '">'+
        recentTitle[i]+
        '</button>'+
        '</div>'
    }
    document.querySelector("#showRecents").style.background = "lightgrey";
    document.querySelector("#showBookmarks").style.background = "white";
    document.querySelectorAll("div.manga-list").forEach(thisdiv =>
        thisdiv.addEventListener("mouseover", () => thisdiv.style.background = "#d1d1d1"));
    document.querySelectorAll("div.manga-list").forEach(thisdiv =>
        thisdiv.addEventListener("mouseleave", () => thisdiv.style.background = "white"));
    //해당 만화로 이동
    document.querySelectorAll(".manga-list-title").forEach(thisLink =>
        thisLink.addEventListener("click", () => mangaView(thisLink.id))
    );
    document.querySelectorAll(".manga-list-title").forEach(thisLink =>
        thisLink.addEventListener("click", () => document.querySelector("div.selector-mangalist").style.display = "none")
    );
    //마우스 설명충
    document.querySelectorAll(".manga-list-title").forEach(thisdiv =>
        thisdiv.addEventListener("mouseover", () => document.querySelector('.explainer').innerText = thisdiv.innerText));
    document.querySelectorAll(".manga-list-title").forEach(thisdiv =>
        thisdiv.addEventListener("mouseover", () => document.querySelector('.explainer').style.display = 'block'));
    document.querySelectorAll(".manga-list-title").forEach(thisdiv =>
        thisdiv.addEventListener("mouseleave", () => document.querySelector('.explainer').style.display = 'none'));
    document.querySelectorAll(".manga-list-title").forEach(thisdiv =>
        thisdiv.addEventListener("click", () => document.querySelector('.explainer').style.display = 'none'));
}

//검색
var searchWord;
var searchCurrentPage;
document.querySelector('#search').addEventListener("click", defineSearchWord);
document.querySelector('#search').addEventListener("click", () => {search(1); searchCurrentPage = 1;});
function defineSearchWord(){    
    searchWord = document.querySelector('#searchBox').value;
}
function search(searchPage){
    previousFunction.push("search("+String(searchPage)+")");
    putImageLoading();
    document.querySelector(".side_list").innerHTML = '';
    document.querySelector(".control_bar").innerHTML = '';
    var cheerio = require('cheerio');
    var request = require('request');
    request('https://'+link+'/comic/p'+searchPage+'?stx='+encodeURI(searchWord), function(error, response, html){
        if (error) {alert("사이트가 불러와지지 않았습니다. 새로고침 해주세요.")};
        var $ = cheerio.load(html);

        var searchTitles = [];
        $('span.title.white').each((index,element) => {
            searchTitles.push($(element).text());
        })

        var searchLinks = [];
        $('div.in-lable.trans-bg-black').each((index,element) => {
            searchLinks.push($(element).find('a').attr('href'));
        })
        
        var searchImg = [];
        $('div.img-item').each((index,element) => {
            searchImg.push($(element).find('img').attr('src'));
        })

        var searchUpdateTimes = [];
        $('div.list-date').each((index,element) => {
            searchUpdateTimes.push($(element).text());
        })

        var searchPublish = [];
        $('div.list-publish').each((index,element) => {
            searchPublish.push($(element).text());
        })

        var searchCurlie = [];
        $('div.list-item').each((index,element) => {
            if($(element).find('div.list-artist').text().length > 0){
                searchCurlie.push($(element).find('div.list-artist').text());
            }
            else{
                searchCurlie.push('');
            }
        })

        var searchPage = 0;
        $('.pagination').find('a').each((index,element) => {
            searchPage++;
        });
        searchPage = searchPage - 4;
        
        //오류?
        if(searchTitles[0] == undefined){
            alert("사이트가 불러와지지 않았습니다.. 새로고침 해주세요.");
        }

        document.querySelector("div.main").innerHTML = '';
        for(i = 0;i<searchTitles.length;i=i+1){
            document.querySelector("div.main").innerHTML += 
            '<div class="main_text">'+
            '<div class="img-container">'+
            '<img src="'+searchImg[i]+'" class="main-image">'+
            '</div>'+
            '<div class="main-title">'+'<strong id="'+searchLinks[i]+'" class="main-manga-link">'+searchTitles[i]+'</strong></div>'+
            '<div class="search-button-and-date">'+
            '<span style="font-size:12px" class="update-date">'+searchPublish[i]+'</span>'+
            '<br>'+
            '<span style="font-size:12px" class="update-date">'+searchUpdateTimes[i]+'</span>'+
            '<br><span style="font-size:10px" class="update-date">'+searchCurlie[i]+'</span>'+'</div>'+
            '</div>';
        }

        //해당 만화로 이동
        document.querySelectorAll(".main-manga-link").forEach(thisLink =>
            thisLink.addEventListener("click", () => listView(thisLink.id))
        );
        //작은 창 이전페이지 다음페이지
        document.querySelector(".control_bar").innerHTML = 
        '<button style="width:30px;height:30px;margin-top:5px;margin-right:20px" id="previousPage">◁</button>'+        
        '<select name="page" id="selectPage_small" style="display:inline-block">'+'</select>';
        for(i=0;i<searchPage;i++){
            document.querySelector("#selectPage_small").innerHTML += '<option value="'+(searchPage-i)+'" id="page_small'+(searchPage-i)+'">'+(searchPage-i)+'페이지</option>';
        };
        document.querySelector(".control_bar").innerHTML +='<button style="width:30px;height:30px;margin-top:5px;margin-left:20px" id="nextPage">▷</button>';

        //큰 창 이전페이지 다음페이지
        document.querySelector(".side_list").innerHTML =
        '<div style="width:100%;height:40px;outline:1px solid black;text-align:center;">'+
        '<button style="width:30px;height:30px;margin-top:5px;margin-right:20px" id="previousPage">◁</button>'+        
        '<select name="page" id="selectPage_big" style="display:inline-block"></select>'+
        '<button style="width:30px;height:30px;margin-top:5px;margin-left:20px" id="nextPage">▷</button>'+
        '</div>';
        for(i=0;i<searchPage;i++){
            document.querySelector("#selectPage_big").innerHTML += '<option value="'+(searchPage-i)+'" id="page_big'+(searchPage-i)+'">'+(searchPage-i)+'페이지</option>';
        }


        //선택
        document.querySelector('#page_small'+String(searchCurrentPage)).selected = "selected";
        document.querySelector('#selectPage_small').addEventListener("change", () =>
        {searchCurrentPage = Number(document.querySelector('#selectPage_small').value);
        search(searchCurrentPage);});

        document.querySelector('#page_big'+String(searchCurrentPage)).selected = "selected";
        document.querySelector('#selectPage_big').addEventListener("change", () =>
        {searchCurrentPage = Number(document.querySelector('#selectPage_big').value);
        search(searchCurrentPage);});

        //이전페이지 다음페이지 버튼
        document.querySelectorAll("#previousPage").forEach(thisbutton =>
            thisbutton.addEventListener("click", previousPage));
        document.querySelectorAll("#nextPage").forEach(thisbutton =>
            thisbutton.addEventListener("click", nextPage));            

        //이전페이지 다음페이지
        function previousPage(){
            if(searchCurrentPage > 1){
                searchCurrentPage = searchCurrentPage-1;
                search(searchCurrentPage);
                console.log(searchCurrentPage)}
            else{
                alert("이전 페이지가 없습니다");
            }
        };
        function nextPage(){
            if(searchCurrentPage < 10){
                searchCurrentPage = searchCurrentPage+1;
                search(searchCurrentPage);
                console.log(searchCurrentPage)
            }
            else{
                alert("다음 페이지가 없습니다");
            }
        };
    })
}



//이미지 다운받기
/*
function downloadImg(file_url , targetPath, downloadedImg, mangaImgSources){

            var request = require('request');
            // Save variable to know progress
            var received_bytes = 0;
            var total_bytes = 0;
        
            var req = request({
                method: 'GET',
                uri: file_url
            });
        
            var out = fs.createWriteStream(targetPath);
            req.pipe(out);
        
            req.on('response', function ( data ) {
                // Change the total bytes value to get progress later.
                total_bytes = parseInt(data.headers['content-length' ]);
            });
        
            req.on('end', function() {
                downloadedImg.push("a");
                if(downloadedImg.length == mangaImgSources.length){
                    alert("다운로드 완료!");
                    createPDF();
                }
            });
        }
*/


//설명충이 마우스 따라댕김
const circle = document.querySelector(".explainer");

document.addEventListener("mousemove", (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    circle.style.left = mouseX - (circle.offsetWidth)/2 - 5 + 'px';
    circle.style.top = mouseY - 5 - (circle.offsetHeight)/2 + 'px';
});

//만화 선택창 없애기
window.onresize = function(event){
    if(window.innerWidth >= 769)
    document.querySelector("div.selector-mangalist").style.display = "none";
    else{
        if(showMangaSelector){
        document.querySelector("div.selector-mangalist").style.display = "block";}
        else{
        document.querySelector("div.selector-mangalist").style.display = "none";
        }
    }
}

//위쪽 아이콘
window.onresize = function(event){
    if(window.innerWidth >= 769){
    document.querySelector("#goback").innerText = "↩이전";
    document.querySelector("#goback").style.width = "100px";
    document.querySelector("#reload").innerText = "⇅업데이트";
    document.querySelector("#reload").style.width = "100px";
    document.querySelector("#refresh").innerText = "⟳새로고침";
    document.querySelector("#refresh").style.width = "100px";
    document.querySelector("#search").innerText = "➔검색";
    document.querySelector("#search").style.width = "100px";
    document.querySelector("#bookmark").innerText = "🔖북마크";
    document.querySelector("#bookmark").style.width = "100px";
    }
    else{
    document.querySelector("#goback").innerText = "↩";
    document.querySelector("#goback").style.width = "30px";
    document.querySelector("#reload").innerText = "⇅";
    document.querySelector("#reload").style.width = "30px";
    document.querySelector("#refresh").innerText = "⟳";
    document.querySelector("#refresh").style.width = "30px";
    document.querySelector("#search").innerText = "➔";
    document.querySelector("#search").style.width = "30px";
    document.querySelector("#bookmark").innerText = "🔖";
    document.querySelector("#bookmark").style.width = "30px";
    }
}

//검색







































































































document.querySelector("#goback").addEventListener("click", gotoPreviousFunction);
document.querySelector("#refresh").addEventListener("click", refreshFunction);
document.querySelector("#reload").addEventListener("click", () => updateView(currentPage));
updateView(currentPage);
}
)