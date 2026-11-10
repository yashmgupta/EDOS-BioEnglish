(function(root){
'use strict';
const courses={
 '258200':{name:'Speak Biology',desc:'Build confidence in everyday biology conversations.',color:'#386945',tint:'#e2eddf',art:'c1',icon:'chat'},
 '258201':{name:'Read & Analyze',desc:'Read research and explain the evidence in English.',color:'#705b8b',tint:'#ece6f2',art:'c2',icon:'book'},
 '258202':{name:'Present Biology',desc:'Share research clearly and answer questions.',color:'#965c38',tint:'#f4e7d7',art:'c3',icon:'present'},
 'grammar':{name:'Grammar Booster',desc:'Practise English grammar with biology examples.',color:'#416d83',tint:'#e2edf2',icon:'type'}
};
const types=['Exercise','Exam','Slides'],levels=['Guided','Independent'];
function makeDraft(lesson,bank,opts={}){
 const type=opts.type||'Exercise',form=opts.form||'A',level=opts.level||'Guided';
 const source=bank[lesson.id][form],total=Number(opts.total)||10,n=source.items.length;
 const items=source.items.map((i,k)=>({...i,marks:Math.floor(total/n)+(k<total%n?1:0),hint:level==='Guided'?i.hint:''}));
 const slides=[
  {title:'Today’s goal',body:[lesson.objective]},
  {title:'Words to know',body:lesson.vocabulary.slice(0,6)},
  {title:'Read and think',body:[source.context]},
  ...items.map((i,k)=>({title:'Task '+(k+1),body:[i.prompt,...(i.hint?[i.hint]:[])]})),
  {title:'Before you finish',body:['Share one answer with a partner.','Which English phrase helped you today?']}
 ].filter(s=>s.body.length);
 return {version:1,title:lesson.title,course:lesson.course,lesson:lesson.id,objective:lesson.objective,minutes:Number(opts.minutes)||20,level,type,form,context:source.context,items,slides};
}
function validate(d,lessons){
 const fail=msg=>{throw Error(msg)};
 if(!d||typeof d!=='object'||d.version!==1)fail('Use a version 1 BioEnglish material file.');
 const l=lessons.find(x=>x.id===d.lesson&&x.course===d.course);
 if(!l)fail('Choose a course and lesson from this studio.');
 if(!types.includes(d.type)||!levels.includes(d.level)||!['A','B'].includes(d.form))fail('Check the material type, English support and form.');
 const str=(s,n,max)=>{if(typeof s!=='string'||!s.trim()||s.length>max)fail(n+' must contain 1–'+max+' characters.');return s.trim()};
 const num=(v,n,max)=>{if(!Number.isInteger(v)||v<1||v>max)fail(n+' must be a whole number from 1 to '+max+'.');return v};
 const itemArr=d.items,slideArr=d.slides;
 if(!Array.isArray(itemArr)||itemArr.length<1||itemArr.length>20)fail('Include 1–20 questions with their answers.');
 if(!Array.isArray(slideArr)||slideArr.length<1||slideArr.length>25)fail('Include 1–25 content slides.');
 return {version:1,title:str(d.title,'Title',120),course:l.course,lesson:l.id,objective:str(d.objective,'Learning goal',500),minutes:num(d.minutes,'Time',240),level:d.level,type:d.type,form:d.form,context:str(d.context,'Reading or task',3500),
 items:itemArr.map((i,k)=>{if(!i||typeof i!=='object')fail('Check question '+(k+1));return {prompt:str(i.prompt,'Question '+(k+1),900),answer:str(i.answer,'Answer '+(k+1),1400),hint:i.hint?str(i.hint,'Hint',450):'',marks:num(i.marks,'Marks',100)}}),
 slides:slideArr.map((s,k)=>{if(!s||!Array.isArray(s.body)||s.body.length<1||s.body.length>10)fail('Add 1–10 lines to slide '+(k+1)+'.');return {title:str(s.title,'Slide title',100),body:s.body.map(b=>str(b,'Slide text',900))}})};
}
const api={courses,types,levels,makeDraft,validate};
if(typeof module!=='undefined')module.exports=api;root.BioModel=api;
})(globalThis);
