import { locale as peachLocale } from "../i18n/index";
import { t as peachT } from "../i18n/index";
/* tutorial 域控制器：本域状态与动作，启动由 Application 的生命周期统一安装。 */
import { cameFromSetup, writeShell } from './../shell/index';
import { isCurrentPostSetupTutorialRequest, nextPostSetupTutorialRequest, postSetupTutorialCollapsed, postSetupTutorialMarker, postSetupTutorialSignature, postSetupTutorialSkipped, resetPostSetupTutorialState, setPostSetupTutorialCollapsed, setPostSetupTutorialMarker, setPostSetupTutorialSkipped } from '../ui-kit';
import { peachHistory, shellNavigate } from './../history/index';
import { $, api, icon } from '../core';
import { navigationState } from './navigation.js';
import { applicationEffects } from './effects';
import { receiptsState } from './receipts.js';
export const tutorialState = { postSetupTutorialDone: undefined, postSetupTutorialNeedsReopen: undefined, postSetupTutorialTasks: undefined, postSetupTutorialHtml: undefined, writePostSetupTutorialDone: undefined, readPostSetupTutorialDone: undefined, openTutorialTarget: undefined };

export async function reopenPostSetupTutorial(){
  resetPostSetupTutorialState();
  await tutorialState.writePostSetupTutorialDone(false);
  await syncPostSetupTutorial();
}

export async function syncPostSetupTutorial(){
  const root=$('#postSetupTutorial');if(!root)return;
  const hide=()=>{root.hidden=true;root.innerHTML='';delete root.dataset.tutorialSignature;
    root.removeAttribute('aria-busy')};
  if(tutorialState.postSetupTutorialNeedsReopen){
    tutorialState.postSetupTutorialNeedsReopen=false;
    await tutorialState.writePostSetupTutorialDone(false).catch(()=>{});
  }
  if(postSetupTutorialMarker()!=='pending'||await tutorialState.readPostSetupTutorialDone()){hide();return}
  const request=nextPostSetupTutorialRequest();root.hidden=false;root.setAttribute('aria-busy','true');
  if(!root.firstElementChild){
    root.innerHTML=peachT("<article class=\"post-setup-notification post-setup-loading\">{{v0}}<p>正在检查安装进度…</p></article>", { v0: icon('compass') });
  }
  try{
    const tasks=await tutorialState.postSetupTutorialTasks();
    if(!isCurrentPostSetupTutorialRequest(request))return;
    const knownKeys=new Set(tasks.map(task=>task.key));
    const skipped=new Set([...postSetupTutorialSkipped()].filter(key=>knownKeys.has(key)));
    setPostSetupTutorialSkipped(skipped);
    const visible=tasks.filter(task=>!skipped.has(task.key));
    const pending=visible.filter(task=>!task.done);
    if(!pending.length){
      setPostSetupTutorialMarker('complete');hide();
      await tutorialState.writePostSetupTutorialDone(true).catch(()=>{});
      return
    }
    const signature=postSetupTutorialSignature(visible);
    if(root.dataset.tutorialSignature===signature){root.removeAttribute('aria-busy');return}
    root.innerHTML=tutorialState.postSetupTutorialHtml(visible,skipped.size,tasks.length);
    root.dataset.tutorialSignature=signature;root.removeAttribute('aria-busy');
    const next=pending[0];
    const collapse=root.querySelector('[data-tutorial-collapse]');
    applicationEffects.handler(collapse, 'onclick', ()=>{
      const card=root.querySelector('.post-setup-notification');
      const collapsed=card.dataset.collapsed!=='true';
      card.dataset.collapsed=String(collapsed);setPostSetupTutorialCollapsed(collapsed);
      collapse.setAttribute('aria-expanded',String(!collapsed));
      collapse.setAttribute('aria-label',collapsed?peachT("展开安装教程"):peachT("折叠安装教程"));
      collapse.innerHTML=icon(collapsed?'chevron-up':'chevron-down');
    });
    root.querySelectorAll('[data-tutorial-skip]').forEach(button=>applicationEffects.handler(button, 'onclick', ()=>{
      const skippedNow=postSetupTutorialSkipped(),key=button.dataset.tutorialSkip;
      skippedNow.add(key);setPostSetupTutorialSkipped(skippedNow);
      receiptsState.actionReceipt(peachT("已跳过「{{v0}}」", { v0: button.dataset.tutorialLabel }),{undo:async()=>{
        const restored=postSetupTutorialSkipped();restored.delete(key);setPostSetupTutorialSkipped(restored);
        setPostSetupTutorialMarker('pending');await syncPostSetupTutorial();
      }});
      void syncPostSetupTutorial();
    }));
    const byKey=new Map(visible.map(task=>[task.key,task]));
    root.querySelectorAll('[data-tutorial-task]').forEach(link=>applicationEffects.handler(link, 'onclick', event=>{
      const task=byKey.get(link.dataset.tutorialTask);
      if(!task||event.metaKey||event.ctrlKey||event.shiftKey||event.button)return;
      event.preventDefault();tutorialState.openTutorialTarget(task);
    }));
    applicationEffects.handler(root.querySelector('[data-tutorial-action]'), 'onclick', ()=>tutorialState.openTutorialTarget(next));
  }catch{
    if(!isCurrentPostSetupTutorialRequest(request))return;
    /* 取数失败时这张卡是死的：没有清单，也没有下一步。给一条重试和一个关闭，
       不然它只能一直杵在右下角占着地方。 */
    root.innerHTML=peachT("<article class=\"post-setup-notification post-setup-error\">{{v0}}\n      <div><h2>暂时无法检查安装进度</h2><p>切换页面或重新打开后会再检查一次。</p>\n      <div class=\"post-setup-error-actions\"><button class=\"geist-button\" type=\"button\" data-tutorial-retry>重试</button>\n      <button class=\"geist-button\" type=\"button\" data-tutorial-dismiss>关闭</button></div></div></article>", { v0: icon('alert') });
    root.removeAttribute('aria-busy');
    applicationEffects.handler(root.querySelector('[data-tutorial-retry]'), 'onclick', ()=>{
      delete root.dataset.tutorialSignature;root.innerHTML='';void syncPostSetupTutorial();
    });
    applicationEffects.handler(root.querySelector('[data-tutorial-dismiss]'), 'onclick', hide);
  }
}

export function installTutorial8() {
writeShell({cameFromSetup:new URLSearchParams(location.search).get('onboarding')==='1'});
tutorialState.postSetupTutorialDone = null;
tutorialState.postSetupTutorialNeedsReopen = false;
if(cameFromSetup){
  setPostSetupTutorialMarker('pending');
  // 数据库里那句「教程做完了」可能是上一次安装留下的，刚走完设置就得撤回。
  tutorialState.postSetupTutorialDone=false;tutorialState.postSetupTutorialNeedsReopen=true;
  const clean=new URL(location.href);clean.searchParams.delete('onboarding');
  shellNavigate(clean,{replace:true,state:peachHistory.navigation.location.state});
}
{
  const clean=new URL(location.href),flag=clean.searchParams.get('agentation');
  if(flag==='on')localStorage.setItem('peach.agentation','on');
  if(flag==='off')localStorage.removeItem('peach.agentation');
  if(flag!==null){
    clean.searchParams.delete('agentation');
    shellNavigate(clean,{replace:true,state:peachHistory.navigation.location.state});
  }
  if(localStorage.getItem('peach.agentation')==='on')import('/dev/agentation.js').catch(()=>{});
}
tutorialState.postSetupTutorialTasks = async()=>{
  const {library,scraping,taste,follow,credentials,review}=await api('/api/post-setup-tutorial');
  const scrapingCredentialSources=(scraping.sources||[]).filter(source=>source.accepts_cookie);
  const savedScrapingCredentials=scrapingCredentialSources.filter(source=>source.cookie_saved);
  const sources=(follow.sources||[]).filter(source=>source.enabled!==false);
  const providers=new Map((credentials.providers||[]).map(row=>[row.provider,row]));
  const required=[...new Set(sources.map(source=>source.provider))]
    .map(provider=>providers.get(provider)).filter(row=>row?.requirement==='required');
  const libraryReady=Number(library.total||0)>0;
  const followReady=sources.length>0;
  const credentialsReady=followReady&&required.every(row=>row.present&&!row.missing?.length);
  const pendingReview=Object.values(review.counts||{})
    .reduce((sum,value)=>sum+(Number(value)||0),0);
  return [
    {key:'library',label:peachT("完成首次扫描"),description:libraryReady
      ?peachT("已经导入 {{v0}} 项馆藏。", { v0: Number(library.total).toLocaleString(peachLocale) }):peachT("等待扫描导入第一项馆藏。"),
      href:'/data-cleanup',done:libraryReady,icon:'scan-search'},
    {key:'scraping',label:peachT("设置采集来源与凭证"),description:savedScrapingCredentials.length
      ?peachT("已为 {{v0}} 个采集来源保存凭证。", { v0: savedScrapingCredentials.length.toLocaleString(peachLocale) })
      :peachT("检查来源连接方式，并为需要登录的来源保存凭证。"),
      href:'/sources',done:savedScrapingCredentials.length>0,icon:'settings'},
    {key:'history',label:peachT("导入浏览器历史记录"),description:Number(taste.history_sources||0)>0
      ?peachT("已导入 {{v0}} 份浏览器历史。", { v0: Number(taste.history_sources).toLocaleString(peachLocale) })
      :peachT("从这台电脑的浏览器导入口味分析记录。"),
      href:'/taste',setupEntry:true,done:Number(taste.history_sources||0)>0,icon:'history'},
    {key:'follow',label:peachT("添加一个关注来源"),description:followReady
      ?peachT("已启用 {{v0}} 个来源。", { v0: sources.length.toLocaleString(peachLocale) }):peachT("添加想持续追踪的创作者或来源。"),
      href:'/subscriptions?tab=add',done:followReady,icon:'rss'},
    {key:'credentials',label:peachT("补齐关注来源凭证"),description:!followReady
      ?peachT("添加关注后，会按来源检查必要凭证。"):required.length
        ?(credentialsReady?peachT("已配置当前来源需要的凭证。"):peachT("{{v0}} 个来源需要凭证。", { v0: required.length.toLocaleString(peachLocale) }))
        :peachT("当前关注来源不需要凭证。"),
      href:'/subscriptions?tab=source',done:credentialsReady,icon:'key-round'},
    {key:'review',label:peachT("处理首次复核"),description:!libraryReady
      ?peachT("扫描完成后，这里会列出需要复核的资料。"):pendingReview
        ?peachT("还有 {{v0}} 条需要复核。", { v0: pendingReview.toLocaleString(peachLocale) }):peachT("首次复核队列已清空。"),
      href:'/review',done:libraryReady&&pendingReview===0,icon:'square-check-big'},
  ];
};
tutorialState.postSetupTutorialHtml = (tasks,skippedCount,totalCount)=>{
  const ordered=[...tasks].sort((left,right)=>Number(left.done)-Number(right.done));
  const next=tasks.find(task=>!task.done);
  const completeCount=tasks.filter(task=>task.done).length+skippedCount;
  const collapsed=postSetupTutorialCollapsed();
  const rows=ordered.map(task=>`<li class="post-setup-task" data-state="${task.done?'checked':'unchecked'}">
    <a href="${task.href}" data-tutorial-task="${task.key}">
      <span class="post-setup-check" aria-hidden="true">${task.done?icon('check'):icon(task.icon)}</span>
      <span><b>${task.label}</b><small>${task.description}</small></span>
      ${icon('chevron-right')}</a>
    ${task.done?'':peachT("<button class=\"post-setup-skip\" type=\"button\" data-tutorial-skip=\"{{v0}}\" data-tutorial-label=\"{{v1}}\">跳过</button>", { v0: task.key, v1: task.label })}
    </li>`).join('');
  return peachT("<article class=\"post-setup-notification\" data-collapsed=\"{{v0}}\">\n      <header class=\"post-setup-notification-head\">\n        <span class=\"post-setup-notification-icon\" aria-hidden=\"true\">{{v1}}</span>\n        <div><h2>完成 Peach 的安装教程</h2>\n        <p>已处理 {{v2}}/{{v3}} 项。</p></div>\n        <button class=\"post-setup-collapse\" type=\"button\" data-tutorial-collapse aria-controls=\"postSetupTaskList\" aria-expanded=\"{{v4}}\"\n          aria-label=\"{{v5}}\">{{v6}}</button>\n      </header>\n      <ol class=\"post-setup-task-list\" id=\"postSetupTaskList\">{{v7}}</ol>\n      <footer><button class=\"geist-button\" type=\"button\" data-tutorial-action=\"next\">继续：{{v8}}</button></footer>\n    </article>", { v0: collapsed, v1: icon('compass'), v2: completeCount, v3: totalCount, v4: !collapsed, v5: collapsed?peachT("展开安装教程"):peachT("折叠安装教程"), v6: icon(collapsed?'chevron-up':'chevron-down'), v7: rows, v8: next.label });
};
tutorialState.writePostSetupTutorialDone = async done=>{
  tutorialState.postSetupTutorialDone=done;
  await api('/api/settings',{method:'POST',body:JSON.stringify({postSetupTutorialDone:done})});
};
tutorialState.readPostSetupTutorialDone = async()=>{
  if(tutorialState.postSetupTutorialDone===null){
    try{tutorialState.postSetupTutorialDone=(await api('/api/settings')).postSetupTutorialDone===true}
    catch{tutorialState.postSetupTutorialDone=false}
  }
  return tutorialState.postSetupTutorialDone;
};
tutorialState.openTutorialTarget = task=>{
  if(task.setupEntry)writeShell({cameFromSetup:true});
  navigationState.navigatePath(task.href);
};
}
