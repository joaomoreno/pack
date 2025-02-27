/* eslint-disable dot-notation */
import { IMaterialData, IMaterialComponent, IMaterialBase } from '@appworks/material-utils';
import { material } from '@appworks/material-engine';
import { window } from 'vscode';
import { IComponentDocInfo } from './type';
import i18n from '../i18n';

let loading = true;
let docInfoCache: IComponentDocInfo[] = [];

const { getSourcesByProjectType, getData } = material;

export function getDocInfos(): IComponentDocInfo[] {
  if (!loading) {
    return docInfoCache;
  } else {
    window.showInformationMessage(i18n.format('extension.iceworksMaterialHelper.getAllDocsInfo.sourceLoading'));
    return [];
  }
}

export async function initDocInfos() {
  docInfoCache = await originGetDocInfos();
  loading = false;
}

async function originGetDocInfos() {
  const getDocInfoFromMaterial = (sourceJson: IMaterialData) => {
    return [...sourceJson.components, ...(sourceJson.bases || [])].map((e: IMaterialComponent | IMaterialBase) => {
      return {
        label: e.name,
        detail: e.title,
        description: e['description'] || '',
        url: e.homepage,
      };
    });
  };

  const projectSource = await getSourcesByProjectType();
  const componentInfos = Promise.all(projectSource.map(({ source }) => getData(source)));
  return (await componentInfos).reduce((componentDocInfos, materialInfo) => {
    return componentDocInfos.concat(getDocInfoFromMaterial(materialInfo));
  }, [] as IComponentDocInfo[]);
}
