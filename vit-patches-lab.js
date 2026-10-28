// A small grayscale image and hand-picked values, not a trained ViT.
export const vitInitial=()=>({pixels:Array.from({length:16},(_,i)=>i),patch:0});
const coordinates=patch=>({row:Math.floor(patch/2),col:patch%2});
export function vitCalculate(pixels){
  if(!Array.isArray(pixels)||pixels.length!==16||pixels.some(v=>!Number.isInteger(v)||v<0||v>15))throw new RangeError('expected sixteen integers from 0 to 15');
  return [0,1,2,3].map(patch=>{
    const {row,col}=coordinates(patch),i=row*8+col*2;
    const flat=[pixels[i],pixels[i+1],pixels[i+4],pixels[i+5]];
    // Multiply a row vector by E = [[.5,0],[0,.5],[.5,0],[0,.5]].
    const projected=[(flat[0]+flat[2])/2,(flat[1]+flat[3])/2];
    const position=[row*0.2,col*0.2];
    return {patch,row,col,flat,projected,position,token:projected.map((x,j)=>x+position[j])};
  });
}
export const vitFirstPixel=patch=>{if(!Number.isInteger(patch)||patch<0||patch>3)throw new RangeError('invalid patch');const {row,col}=coordinates(patch);return row*8+col*2;};
const f=n=>n.toFixed(2);
const vec=a=>`[${a.map(f).join(', ')}]`;
export function vitMarkup(state,lang){
  const ko=lang==='ko', patches=vitCalculate(state.pixels);
  const positions=ko?['왼쪽 위','오른쪽 위','왼쪽 아래','오른쪽 아래']:['top left','top right','bottom left','bottom right'];
  return `<section class="metric-lab vit-lab" aria-labelledby="vit-lab-title">
  <h2 id="vit-lab-title">${ko?'이미지 패치에서 Transformer 토큰으로':'From image patches to Transformer tokens'}</h2>
  <p>${ko?'4×4 흑백 이미지의 숫자는 픽셀 값입니다. 네 패치 중 하나를 선택한 뒤 그 패치의 왼쪽 위 픽셀을 바꾸어 토큰이 어떻게 달라지는지 확인하세요.':'The numbers in this 4×4 grayscale image are pixel values. Select one of the four patches, then change its top-left pixel to see how the token changes.'}</p>
  <div class="vit-grid" role="group" aria-label="${ko?'2×2 크기의 이미지 패치 네 개':'Four 2×2 image patches'}">${patches.map((p,i)=>`<button type="button" data-vit-patch="${i}" aria-pressed="${i===state.patch}" aria-label="${ko?'패치':'Patch'} ${i+1}, ${positions[i]}"><span class="vit-patch-name">${ko?'패치':'Patch'} ${i+1}</span><span class="vit-pixels">${p.flat.map((v,j)=>`<span data-vit-pixel="${i}-${j}">${v}</span>`).join('')}</span></button>`).join('')}</div>
  <label class="pca-control" for="vit-pixel">${ko?'선택한 패치의 왼쪽 위 픽셀':'Selected patch’s top-left pixel'} <output id="vit-pixel-value">${state.pixels[vitFirstPixel(state.patch)]}</output></label>
  <input id="vit-pixel" data-vit-pixel-control type="range" min="0" max="15" step="1" value="${state.pixels[vitFirstPixel(state.patch)]}">
  <div id="vit-output" aria-live="polite">${vitOutput(state,lang)}</div>
  <p>${ko?'투영 행렬, 위치 벡터와 분류 토큰은 계산을 위한 임의 값으로 고정했습니다. 이미지를 분류하거나 인코더를 실행하지 않습니다. 실제 ViT는 패치 투영과 위치 임베딩 등을 데이터에서 학습하며, RGB 이미지라면 패치 벡터의 길이는 P×P×3입니다.':'The projection matrix, position vectors and class token are fixed illustrative values. This example neither runs the encoder nor classifies an image. An actual ViT learns its patch projection and position embeddings; for RGB input, each flattened patch has P×P×3 components.'}</p>
  <p><a href="https://arxiv.org/abs/2010.11929" target="_blank" rel="noopener noreferrer">${ko?'원 논문: Vision Transformer':'Original Vision Transformer paper'} ↗</a></p></section>`;
}
export function vitOutput(state,lang){
  const ko=lang==='ko',patches=vitCalculate(state.pixels),p=patches[state.patch];
  const rows=patches.map(p=>`<tr${p.patch===state.patch?' class="xor-selected"':''}><th scope="row">${p.patch+1}</th><td>${vec(p.projected)}</td><td>${vec(p.position)}</td><td>${vec(p.token)}</td></tr>`).join('');
  return `<ol class="xor-steps"><li><strong>${ko?'패치를 펼치기':'Flatten a patch'}</strong><p>N = (4/2) × (4/2) = 4; P×P×C = 2×2×1 = 4<br>${ko?'선택한 패치':'Selected patch'} ${p.patch+1}: [[${p.flat[0]}, ${p.flat[1]}], [${p.flat[2]}, ${p.flat[3]}]] → x = [${p.flat.join(', ')}]</p><p>${ko?'위쪽 행부터 차례로 읽어 길이 4인 벡터로 만듭니다.':'Read the top row first to make a vector of length 4.'}</p></li>
  <li><strong>${ko?'모든 패치에 같은 투영 적용':'Apply the same projection to every patch'}</strong><p>E = [[0.5, 0], [0, 0.5], [0.5, 0], [0, 0.5]] ${ko?'(4×2)':'(4×2)'}<br>xE = [(${p.flat[0]}+${p.flat[2]})/2, (${p.flat[1]}+${p.flat[3]})/2] = ${vec(p.projected)}</p><p>${ko?'길이 4의 픽셀 벡터를 길이 2의 특징 벡터로 바꿉니다. 모든 위치가 같은 E를 사용합니다.':'The length-4 pixel vector becomes a length-2 feature vector. Every position uses the same E.'}</p></li>
  <li><strong>${ko?'위치 벡터 더하기':'Add a position vector'}</strong><p>${ko?'위치 벡터':'Position vector'} = ${vec(p.position)}; ${ko?'패치 토큰':'Patch token'} = ${vec(p.projected)} + ${vec(p.position)} = <strong>${vec(p.token)}</strong></p><p>${ko?'이 예제의 위치 벡터는 패치가 있는 행과 열로 정한 가상 값입니다. 값이 같은 패치라도 다른 위치 벡터를 받습니다.':'These illustrative position vectors depend on the patch row and column. Identical patches at different positions receive different vectors.'}</p></li>
  <li><strong>${ko?'분류 토큰을 앞에 놓기':'Prepend the class token'}</strong><p>[CLS] + ${ko?'분류 위치':'class position'} = [0.50, −0.50] + [0.10, 0.10] = [0.60, −0.40]<br>${ko?'인코더 입력':'Encoder input'} = [[CLS], ${ko?'패치':'patch'} 1, ${ko?'패치':'patch'} 2, ${ko?'패치':'patch'} 3, ${ko?'패치':'patch'} 4] → 5 × 2</p><p>${ko?'원래 ViT 분류기는 인코더를 지난 분류 토큰의 출력을 사용합니다. 위 [CLS]는 입력 토큰의 이름이지 최종 출력이나 예측이 아닙니다.':'The original ViT classifier uses the class-token output after the encoder. [CLS] above names an input token, not a final output or prediction.'}</p></li></ol>
  <p>${ko?'다른 위치의 결과도 비교하세요. 표가 잘리면 초점을 둔 후 방향키로 가로 스크롤할 수 있습니다.':'Compare other positions too. If the table is clipped, focus it and use the arrow keys to scroll horizontally.'}</p>
  <div class="xor-table-wrap" role="region" tabindex="0" aria-label="${ko?'네 패치의 토큰 표':'Tokens for all four patches'}"><table><thead><tr><th>${ko?'패치':'Patch'}</th><th>${ko?'투영':'Projection'}</th><th>${ko?'위치':'Position'}</th><th>${ko?'입력 토큰':'Input token'}</th></tr></thead><tbody>${rows}</tbody></table></div>
  <p>${ko?'표시값만 반올림합니다. 이 축소 예제와 Transformer 원본 실습의 GPT-2는 입력과 가중치를 공유하지 않습니다.':'Only displayed values are rounded. This toy does not share inputs or weights with GPT-2 in the original Transformer lab.'}</p>`;
}
