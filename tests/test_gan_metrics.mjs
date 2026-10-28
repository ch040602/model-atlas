import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import vm from 'node:vm';

const require = createRequire(new URL('../upstream/ganlab/package.json', import.meta.url));
const ts = require('typescript');
const compile = source => ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017}}).outputText;
const evaluatorSource = await readFile(new URL('../upstream/ganlab/demo/ganlab_evaluators.ts', import.meta.url), 'utf8');
const context = {exports: {}};
vm.runInNewContext(compile(evaluatorSource), context);
const Evaluator = context.exports.GANLabEvaluatorGridDensities;

// Every pair contributes exactly once, and the caller's sample atlas remains intact.
const points = [0.1, 0.1, 0.9, 0.1, 0.1, 0.9, 0.9, 0.9];
const original = points.slice();
const evaluator = new Evaluator(2);
evaluator.createGridsForTrue(points, 4);
assert.deepEqual(points, original);
assert.deepEqual(Array.from(evaluator.gridTrueDensities), [0.25, 0.25, 0.25, 0.25]);
evaluator.updateGridsForGenerated([[0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]]);
assert.equal(evaluator.getKLDivergenceScore(), 0);
assert.equal(evaluator.getJSDivergenceScore(), 0);

// Values outside [0,1] and the inclusive upper edge map to the nearest cell.
const edge = new Evaluator(2);
edge.createGridsForTrue([-0.1, 0.2, 1, 0.2, 0.2, -0.1, 0.2, 1.1], 4);
edge.updateGridsForGenerated([[-0.1, 0.2], [1, 0.2], [0.2, -0.1], [0.2, 1.1]]);
assert.deepEqual(Array.from(edge.gridTrueDensities), [0.5, 0.25, 0.25, 0]);
assert.deepEqual(Array.from(edge.gridGeneratedDensities), [0.5, 0.25, 0.25, 0]);
assert.equal(edge.getKLDivergenceScore(), 0);

// Exercise the actual chart data method: a real zero must not disappear as null.
const source = (await readFile(new URL('../upstream/ganlab/demo/ganlab.ts', import.meta.url), 'utf8')).replaceAll('\r\n', '\n');
const chartMethod = source.match(/  private updateChartData\([\s\S]*?\n  }\n\n  private createChart/)?.[0].replace(/\n\n  private createChart$/, '');
assert.ok(chartMethod);
const chartContext = {exports: {}};
vm.runInNewContext(compile(`type ChartData = any; export class ChartHarness { ${chartMethod.replace('private updateChartData', 'updateChartData')} }`), chartContext);
const series = [[], [], []];
new chartContext.exports.ChartHarness().updateChartData(series, 7, [0, 0.25, NaN]);
assert.equal(series[0][0].y, '0.000');
assert.equal(series[1][0].y, '0.250');
assert.equal(series[2][0].y, null);

const kl = .75*Math.log2(.75/.5) + .25*Math.log2(.25/.5);
const js = .5*(.75*Math.log2(.75/.625)+.25*Math.log2(.25/.375)+.5*Math.log2(.5/.625)+.5*Math.log2(.5/.375));
assert.ok(Math.abs(kl-.189)<.001 && Math.abs(js-.049)<.001);
// Check the actual 30×30 evaluator's additive smoothing and lack of renormalization.
const smooth = new Evaluator(30);
smooth.createGridsForTrue([.01,.01,.01,.01,.01,.01,.05,.01],4);
smooth.updateGridsForGenerated([[.01,.01],[.01,.01],[.05,.01],[.05,.01]]);
const epsilon=.0001, mass=1+900*epsilon;
const p=[.75+epsilon,.25+epsilon], q=[.5+epsilon,.5+epsilon];
const smoothedKl=p.reduce((sum,pi,i)=>sum+pi*Math.log2(pi/q[i]),0);
const smoothedJs=p.reduce((sum,pi,i)=>{const m=(pi+q[i])/2;return sum+.5*(pi*Math.log2(pi/m)+q[i]*Math.log2(q[i]/m));},0);
assert.ok(Math.abs(smooth.getKLDivergenceScore()-smoothedKl)<1e-12);
assert.ok(Math.abs(smooth.getJSDivergenceScore()-smoothedJs)<1e-12);
assert.ok(Math.abs(mass-1.09)<1e-12);
assert.ok(Math.abs(smooth.getJSDivergenceScore()/mass-smoothedJs)>1e-4);
console.log('PASS: GAN evaluator sample counting, boundary cells, zero chart values and documented metric example');
