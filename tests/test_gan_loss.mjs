import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {ganTrainingExperiment} from '../gan-training-lab.js';

const require=createRequire(new URL('../upstream/ganlab/package.json',import.meta.url));
const ts=require('typescript'), tf=require('@tensorflow/tfjs-core');
const source=await readFile(new URL('../upstream/ganlab/demo/ganlab_models.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017}}).outputText;
const context={exports:{},require};
vm.runInNewContext(code,context);
const Model=context.exports.GANLabModel;
const real=tf.tensor1d([0.8]), fake=tf.tensor1d([0.2]);
try {
  for(const [type,d,g] of [['Log loss',-1.95*Math.log(.8),-Math.log(.2)],['LeastSq loss',.08,.64]]) {
    const model=new Model(2,1,1,8,8,150,type);
    assert.equal(model.lossType,type,'constructor preserves the selected loss');
    const example=ganTrainingExperiment(1,0.4,-1,0.2);
    const predicted=tf.tensor1d([example.nextDFake]);
    const compared=model.gLoss(predicted);
    try {
      const toy=type==='Log loss'?example.gLoss:example.squareLoss;
      assert.ok(Math.abs(compared.dataSync()[0]-toy)<1e-6,`${type}: toy generator loss matches original model`);
    } finally {predicted.dispose();compared.dispose();}
    const dLoss=model.dLoss(real,fake), gLoss=model.gLoss(fake);
    try {
      assert.ok(Math.abs(dLoss.dataSync()[0]-d)<1e-6,`${type}: discriminator loss`);
      assert.ok(Math.abs(gLoss.dataSync()[0]-g)<1e-6,`${type}: generator loss`);
    } finally { dLoss.dispose(); gLoss.dispose(); }
  }
} finally {real.dispose();fake.dispose();}
console.log('PASS: GAN constructor preserves selected loss and both actual loss formulas');
