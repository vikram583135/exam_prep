function shuffle(list){
 const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a;
}
function factItem(g,[term,detail],style){
  const others=shuffle(g.facts.filter(f=>f[0]!==term));
  const [b,c,d]=others;

  let prompt,choices,detailText=term+' — '+detail;
  if(style===0){
   prompt='Which entry best fits the following description?\n\n'+detail;
   choices=[term,b[0],c[0],d[0]];
  }else if(style===1){
   prompt='Which statement correctly describes '+term+'?';
   choices=[detail,b[1],c[1],d[1]];
  }else if(style===2){
   const aTrue=Math.random()<.5,bTrue=Math.random()<.5;
   prompt='Consider these two associations.\n\nI. '+term+' — '+(aTrue?detail:c[1])+'\nII. '+b[0]+' — '+(bTrue?b[1]:d[1])+'\n\nWhich associations are correct?';
   const labels=['Neither I nor II','I only','II only','Both I and II'];const answer=labels[Number(aTrue)+2*Number(bTrue)];
   choices=[answer,...labels.filter(x=>x!==answer)];detailText+='\n'+b[0]+' — '+b[1];
  }else if(style===3){
   const right=shuffle([detail,b[1],c[1]]);
   const code=[detail,b[1],c[1]].map(x=>right.indexOf(x)+1).join(' – ');
   const codes=['1 – 2 – 3','1 – 3 – 2','2 – 1 – 3','2 – 3 – 1','3 – 1 – 2','3 – 2 – 1'];
   prompt='Match A, B and C with descriptions 1, 2 and 3.\n\nA. '+term+'\nB. '+b[0]+'\nC. '+c[0]+'\n\n'+right.map((x,i)=>(i+1)+'. '+x).join('\n');
   choices=[code,...shuffle(codes.filter(x=>x!==code)).slice(0,3)];detailText+='\n'+b[0]+' — '+b[1]+'\n'+c[0]+' — '+c[1];
  }else{
   prompt='Identify the correctly matched pair from the following '+g.category+'.';
   choices=[term+' — '+detail,b[0]+' — '+c[1],c[0]+' — '+d[1],d[0]+' — '+b[1]];
  }
  return {id:'f'+g.topic+'-'+g.facts.findIndex(f=>f[0]===term),topic:g.topic,prompt,choices,explanation:detailText};
}
function mathItems(topic){
 const n=4+Math.floor(Math.random()*15);
 const quantitative=[
 ['A library has '+(n*20)+' books. If 15% are reference books, how many are reference books?',3*n,'Multiply the total by 15/100.'],
 ['A tank holds '+(n*60)+' litres. A pump adds 12 litres per minute. How many minutes does filling an empty tank take?',5*n,'Divide the required volume by the flow rate.'],
 ['A village fund of ₹'+(n*900)+' is divided in the ratio 2 : 3 : 4. What is the largest share in rupees?',400*n,'The largest share is four of nine equal parts.'],
 ['The cost of '+(2*n)+' notebooks is ₹'+(30*n)+'. A school buys '+(n+5)+'. What is its bill in rupees?',15*(n+5),'Each notebook costs ₹15. Multiply by the quantity ordered.'],
 ['A worker travels '+(n*6)+' km at 12 km/h and returns at 6 km/h. What is the total time in minutes?',90*n,'Add the two journey times in hours, then multiply by 60.'],
 ['A cooperative receives '+(8*n)+', '+(10*n)+' and '+(15*n)+' litres on three days. What is the daily mean in litres?',11*n,'Sum the three quantities and divide by three.'],
 ['A rectangular garden is '+(n+4)+' m long and '+n+' m wide. Find the fencing needed in metres for two complete rounds.',8*n+16,'Two rounds require four times the sum of length and width.'],
 ['A deposit of ₹'+(1000*n)+' earns 6% simple interest per year. Find the interest in rupees after two years.',120*n,'Interest equals principal × rate × time / 100.'],
 ['A chart records '+(3*n)+' students travelling by bus and '+(5*n)+' walking. What angle in degrees represents bus travel in a pie chart?',135,'Three eighths of a complete 360° circle is 135°.'],
 ['A shop reduces a ₹'+(125*n)+' item by 20%, then adds 5% to the reduced price. Find the final price in rupees.',105*n,'Multiply the original price by 0.80 and then by 1.05.']
 ];
 const reasoning=[
 ['Complete the series: '+[n,n+2,n+6,n+12].join(', ')+', …',n+20,'Successive differences are 2, 4, 6 and 8.'],
 ['A student is '+n+'th from the left and '+(n+7)+'th from the right. How many students are in the row?',2*n+6,'Add both ranks and subtract one for the shared student.'],
 ['A cube is painted on every face and cut into '+(n**3)+' equal small cubes in a regular grid. How many have exactly two painted faces?',12*(n-2),'Each of twelve edges has n − 2 cubes away from its corners.'],
 ['In a group, '+(n+12)+' study science, '+(n+7)+' study history, and '+n+' study both. How many study at least one?',n+19,'Add both group sizes and subtract their intersection.'],
 ['How many handshakes occur if each of '+n+' people shakes hands with every other person exactly once?',n*(n-1)/2,'Count unordered pairs using n(n − 1)/2.'],
 ['A clock reads 3:00. After '+(n*4)+' minutes, through how many degrees has the minute hand turned?',24*n,'The minute hand turns six degrees per minute.'],
 ['A person walks '+(3*n)+' m east and '+(4*n)+' m north. Find the straight-line distance from the start in metres.',5*n,'Use the right triangle with sides in the ratio 3 : 4 : 5.'],
 ['In a queue of '+(4*n)+' people, Ravi is '+n+'th. He moves past three people ahead of him. What is his new rank?',n-3,'Passing three people improves the rank by three.'],
 ['A code assigns A = 1 through Z = 26 and adds the letters. If the score for INK is increased by '+n+', what is the result?',34+n,'I + N + K equals 9 + 14 + 11 = 34.'],
 ['What is the smallest positive number divisible by both '+(3*n)+' and '+(4*n)+'?',12*n,'The least common multiple of 3n and 4n is 12n.'],
 ['A staircase pattern has 1 tile in row one, 2 in row two and so on. How many tiles are in the first '+n+' rows?',n*(n+1)/2,'Use the sum of the first n natural numbers, n(n + 1)/2.']
 ];
 const advanced=topic===7?[
  ['A tank contains '+(12*n)+' L of solution at 25% salt. How many litres of pure water bring it to 20%?',3*n,[2*n,4*n,5*n],'Dilution preserves the salt quantity, so final volume = initial volume × 25/20. The final volume is '+15*n+' L, so add '+3*n+' L.'],
  ['A population grows by 20% and then falls by 20%. The final count is '+(96*n)+'. What was the original count?',100*n,[96*n,120*n,80*n],'The two factors multiply to 0.96. Divide the final count by 0.96.'],
  ['Team A can finish a survey in '+(3*n)+' days and team B in '+(6*n)+' days. At constant independent rates, how many days do they need together?',2*n,[3*n,4*n,9*n],'Their daily rates add to 1/(2n), where n = '+n+'. Invert the combined rate.'],
  ['Two wards have mean daily supplies of 40 and 70 litres per household, covering '+(2*n)+' and '+n+' households respectively. Find the overall household mean.',50,[55,60,45],'Weight each mean by its household count: (2 × 40 + 70) / 3 = 50.']
 ]:[
  ['From '+n+' women and 3 men, a committee selects one woman and two men. How many distinct committees are possible?',3*n,[6*n,2*n,n+2],'Choose one of the women, then an unordered pair of men in three ways.'],
  ['A timetable repeats one service every '+(2*n)+' minutes and another every '+(3*n)+' minutes. They leave together at noon. How many simultaneous departures follow up to and including '+(24*n)+' minutes later?',4,[3,5,6],'The interval is 6n minutes. The four coincidences occur at 6n, 12n, 18n and 24n, excluding noon.'],
  ['A class has '+(5*n)+' students. Exactly '+(3*n)+' speak Kannada and '+(3*n)+' speak English. What is the minimum number who must speak both?',n,[0,2*n,3*n],'The two counts total 6n. Fitting them into 5n places forces an overlap of at least n.'],
  ['A bag holds '+n+' red and '+(n+1)+' blue tokens. Tokens are drawn without replacement or inspection. How many draws guarantee at least two red?',n+3,[n+1,n+2,2*n],'In the worst case all blue tokens are drawn first. Two further draws must be red.']
 ];
 const challenge=advanced.map(([prompt,key,distractors,explanation],i)=>({id:'advanced-'+topic+'-'+i+'-'+n,topic,prompt,choices:[key,...distractors].map(String),explanation}));
 return (topic===7?quantitative:reasoning).map(([prompt,key,explanation],i)=>{
 const delta=Math.max(1,Math.round(key/10));
 return {id:'m'+topic+'-'+i+'-'+n,topic,prompt,choices:[key,key+delta,key+2*delta,Math.max(0,key-delta)].map(String),explanation};
 }).concat(challenge);
}
function makePaper(){
 // Ten list matches occur in the 2017 General Paper I booklet. Other targets are provisional.
 const range=eventWindow();
 const selected=exam.topics.flatMap(([,count],topic)=>{
  const additions=extraItems.filter(q=>q.topic===topic);
  if(topic===0){
   const available=shuffle([...currentBank,...additions].filter(q=>inWindow(q.eventDate,range)));
   if(available.length<count)throw new Error('Refresh current-affairs bank: fewer than 12 eligible items.');
   return available.slice(0,count);
  }
  const group=groups.find(g=>g.topic===topic);
  if(!group){
   const pool=mathItems(topic),hard=shuffle(pool.filter(q=>q.id.startsWith('advanced-'))).slice(0,3);
   return [...hard,...shuffle([...pool.filter(q=>!q.id.startsWith('advanced-')),...additions]).slice(0,count-hard.length)];
  }
  const cases=shuffle([...appliedBank.filter(q=>q.topic===topic),...additions]).slice(0,Math.min(2,count));
  return [...cases,...shuffle(group.facts).slice(0,count-cases.length).map(fact=>({group,fact}))];
 });
 const factCount=selected.filter(q=>q.group).length;
 const styles=shuffle([...Array(10).fill(3),...Array(16).fill(2),...Array(5).fill(4),...Array.from({length:factCount-31},(_,i)=>i%2)]);
 if(selected.length!==100)throw Error('Paper blueprint must total 100');
 return shuffle(selected).map(item=>{const q=item.group?factItem(item.group,item.fact,styles.pop()):item;const options=shuffle(q.choices);return {id:q.id,topic:q.topic,eventDate:q.eventDate,source:q.source,prompt:q.prompt,options,key:options.indexOf(q.choices[0]),explanation:q.explanation}});
}
