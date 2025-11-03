
import { Script } from '../types';
import { LOCAL_STORAGE_SCRIPT_KEY } from '../constants';

export const saveScriptToLocalStorage = (script: Script[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_SCRIPT_KEY, JSON.stringify(script));
  } catch (error) {
    console.error("Failed to save scripts to local storage:", error);
  }
};

export const loadScriptsFromLocalStorage = (): Script[] => {
  try {
    const storedScripts = localStorage.getItem(LOCAL_STORAGE_SCRIPT_KEY);
    return storedScripts ? JSON.parse(storedScripts) : [];
  } catch (error) {
    console.error("Failed to load scripts from local storage:", error);
    return [];
  }
};

export const addOrUpdateScript = (currentScripts: Script[], newScript: Script): Script[] => {
  const existingIndex = currentScripts.findIndex(s => s.id === newScript.id);
  if (existingIndex > -1) {
    const updatedScripts = [...currentScripts];
    updatedScripts[existingIndex] = { ...newScript, lastModified: Date.now() };
    saveScriptToLocalStorage(updatedScripts);
    return updatedScripts;
  } else {
    const scriptsWithNew = [...currentScripts, { ...newScript, lastModified: Date.now() }];
    saveScriptToLocalStorage(scriptsWithNew);
    return scriptsWithNew;
  }
};

export const deleteScript = (currentScripts: Script[], scriptId: string): Script[] => {
  const filteredScripts = currentScripts.filter(s => s.id !== scriptId);
  saveScriptToLocalStorage(filteredScripts);
  return filteredScripts;
};
