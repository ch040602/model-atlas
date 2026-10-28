// Target box [1,1,5,4]; prediction [x,1,x+3,4]. Coordinates are arbitrary units.
export function boxIoU(x,threshold){
 if(!Number.isInteger(x)||x<0||x>7||!Number.isFinite(threshold)||threshold<0.1||threshold>0.9)throw new RangeError('invalid box position or threshold');
 const target={left:1,top:1,right:5,bottom:4},prediction={left:x,top:1,right:x+3,bottom:4};
 const width=Math.max(0,Math.min(target.right,prediction.right)-Math.max(target.left,prediction.left));
 const height=Math.max(0,Math.min(target.bottom,prediction.bottom)-Math.max(target.top,prediction.top));
 const intersection=width*height,targetArea=12,predictionArea=9,union=targetArea+predictionArea-intersection;
 const iou=intersection/union;
 return {target,prediction,width,height,intersection,targetArea,predictionArea,union,iou,passes:iou>=threshold};
}
const f=x=>x.toFixed(3);
export function iouMarkup(settings,lang){
 const ko=lang==='ko';
 return `<section class="metric-lab iou-lab" aria-labelledby="iou-title">
 <h2 id="iou-title">${ko?'상자를 움직이며 IoU 계산하기':'Move a box and calculate IoU'}</h2>
 <p>${ko?'정답 상자는 고정하고 예측 상자를 좌우로 옮깁니다. 겹치는 넓이와 합집합을 구한 뒤 선택한 기준과 비교해 보세요.':'Keep the target box fixed and move the prediction left or right. Calculate intersection and union, then compare IoU with the chosen threshold.'}</p>
 <label class="pca-control" for="iou-x">${ko?'예측 상자 왼쪽 x':'Prediction left x'} <output id="iou-x-value">${settings.x}</output></label><input type="range" id="iou-x" data-iou-x min="0" max="7" step="1" value="${settings.x}">
 <label class="pca-control" for="iou-threshold">${ko?'IoU 비교 기준':'IoU comparison threshold'} <output id="iou-threshold-value">${f(settings.threshold)}</output></label><input type="range" id="iou-threshold" data-iou-threshold min="0.1" max="0.9" step="0.05" value="${settings.threshold}">
 <div id="iou-output" aria-live="polite"></div>
 <p>${ko?'이 비교는 상자 위치만 봅니다. 검출 평가는 클래스, 신뢰도 순서, 하나의 정답에 대한 중복 예측 처리 등을 함께 고려하며, 이 결과 하나가 AP나 전체 정확도는 아닙니다.':'This compares only box geometry. Detection evaluation also considers class, confidence ranking and duplicate matches; this single result is not AP or overall accuracy.'} <a href="https://docs.pytorch.org/vision/stable/generated/torchvision.ops.box_iou.html" target="_blank" rel="noopener noreferrer">${ko?'IoU 참고 자료':'IoU reference'} ↗</a></p></section>`;
}
export function iouOutput(settings,lang){
 const ko=lang==='ko',r=boxIoU(settings.x,settings.threshold),scale=30,pad=15;
 const svgBox=(box,css)=>`<rect x="${pad+box.left*scale}" y="${pad+box.top*scale}" width="${(box.right-box.left)*scale}" height="${(box.bottom-box.top)*scale}" class="${css}"/>`;
 return `<div class="iou-diagram-wrap"><svg class="iou-diagram" viewBox="0 0 330 180" role="img" aria-label="${ko?'고정 정답 상자와 움직이는 예측 상자':'Fixed target box and movable prediction box'}">${svgBox(r.target,'iou-target')}${svgBox(r.prediction,'iou-prediction')}</svg></div>
 <p>${ko?'초록: 정답 상자 · 주황: 예측 상자':'Green: target box · orange: prediction box'}</p>
 <div class="iou-results"><p><b>${ko?'① 넓이':'① Areas'}</b><br>${ko?'정답':'Target'}: 4 × 3 = ${r.targetArea}; ${ko?'예측':'prediction'}: 3 × 3 = ${r.predictionArea}</p>
 <p><b>${ko?'② 겹친 부분':'② Intersection'}</b><br>${ko?'겹친 너비 × 높이':'Overlap width × height'} = ${r.width} × ${r.height} = <strong data-iou-result="intersection">${r.intersection}</strong></p>
 <p><b>${ko?'③ 합집합과 IoU':'③ Union and IoU'}</b><br>${ko?'합집합':'Union'} = ${r.targetArea} + ${r.predictionArea} − ${r.intersection} = ${r.union}<br>IoU = ${r.intersection} / ${r.union} = <strong data-iou-result="iou">${f(r.iou)}</strong></p>
 <p><b>${ko?'④ 기준과 비교':'④ Compare with threshold'}</b><br>${f(r.iou)} ${r.passes?'≥':'<'} ${f(settings.threshold)}: <strong data-iou-result="comparison">${r.passes?(ko?'기준 이상':'at or above threshold'):(ko?'기준 미만':'below threshold')}</strong></p></div>`;
}
