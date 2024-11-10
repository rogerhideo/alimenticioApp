import {PermissionsAndroid} from 'react-native';
import axios, {AxiosResponse} from 'axios';

import 'moment/locale/pt-br';
import moment from 'moment';

import {
  AxiosSuccessResponse,
  AxiosErrorResponse,
  axiosMethods,
  AxiosMethod,
} from '../types/utils';
import {Snack} from '../components/snack';

export const delay = (milliseconds: number = 1500) => {
  return new Promise((resolve: any) => {
    setTimeout(resolve, milliseconds);
  });
};

export const cpfMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const cnpjMask = (text: string | undefined) => {
  if (text !== undefined) {
    return text
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})(\d)/, '$1')
      .substring(0, 18);
  }
  return '';
};

export const monthYear = (text: string | undefined) => {
  if (text !== undefined) {
    return text.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2');
  }
  return '';
};

export const states = [
  {code: 12, name: 'Acre'},
  {code: 27, name: 'Alogoas'},
  {code: 13, name: 'Amazonas'},
  {code: 16, name: 'Amapá'},
  {code: 29, name: 'Bahia'},
  {code: 23, name: 'Ceará'},
  {code: 53, name: 'Distrito Federal'},
  {code: 32, name: 'Espírito Santo'},
  {code: 52, name: 'Goiás'},
  {code: 21, name: 'Maranhão'},
  {code: 31, name: 'Minas Gerais'},
  {code: 50, name: 'Mato Grosso do Sul'},
  {code: 51, name: 'Mato Grosso'},
  {code: 15, name: 'Pará'},
  {code: 25, name: 'Paraíba'},
  {code: 26, name: 'Pernambuco'},
  {code: 22, name: 'Piauí'},
  {code: 41, name: 'Paraná'},
  {code: 33, name: 'Rio de Janeiro'},
  {code: 24, name: 'Rio Grande do Norte'},
  {code: 11, name: 'Rondônia'},
  {code: 14, name: 'Roraima'},
  {code: 43, name: 'Rio Grando do Sul'},
  {code: 42, name: 'Santa Catarina'},
  {code: 28, name: 'Sergipe'},
  {code: 35, name: 'São Paulo'},
  {code: 17, name: 'Tocantins'},
];

export const cepRegex = /^([\d]{2})([\d]{3})([\d]{3})|^[\d]{2}.[\d]{3}-[\d]{3}/;

export const cnpjRegex =
  /^(([0-9]{2}.[0-9]{3}.[0-9]{3}\/[0-9]{4}-[0-9]{2})|([0-9]{14}))$/;

export const retrieveCitiesByState = async (state: number | undefined) => {
  try {
    if (state === undefined) {
      return [];
    }
    const response = await axios.get(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`,
    );
    if (response.status === 200 && response.data.length > 0) {
      return response.data;
    }
    return [];
  } catch (error) {
    Error('Erro ao buscar cidades');
  }
};

export const cepMask = (text: string | undefined) => {
  if (text !== undefined) {
    return text
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  }
  return '';
};

export const handleRequestCNPJData = async (cnpj: string) => {
  try {
    const options = {
      method: 'GET',
      url: `https://www.receitaws.com.br/v1/cnpj/${cnpj}`,
      headers: {Accept: 'application/json'},
    };
    // const header = {
    //   'Content-Type': 'application/json',
    //   autorization: 'Bearer ' + process.env.RECEITAWS_TOKEN,
    // };
    const response = await axios.request(options);
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const localNumber = (weight: string | undefined, digits?: number) => {
  if (weight === undefined) {
    return 0;
  }

  if (weight.includes(',') && weight !== undefined) {
    let parsedWeight = weight.replace(',', '.');
    return Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: digits !== undefined ? digits : 2,
      minimumFractionDigits: digits !== undefined ? digits : 2,
    }).format(Number(parsedWeight));
  }
  return Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: digits !== undefined ? digits : 2,
    minimumFractionDigits: digits !== undefined ? digits : 2,
  }).format(Number(weight));
};

export const greetings = () => {
  let now = new Date().getHours();
  let morning = 'Bom dia';
  let afternoon = 'Boa tarde';
  let evening = 'Boa noite';

  if (now >= 0 && now < 12) {
    return morning;
  } else if (now >= 12 && now < 17) {
    return afternoon;
  } else if (now >= 17 && now < 24) {
    return evening;
  }
};

export const insertsPlaceholder = (
  templates: number,
  numberInserts: number,
) => {
  let templateInserts: string[] = [];
  for (let i = 0; i < templates; i++) {
    templateInserts.push('?');
  }
  const modelTemplate = `(${templateInserts.join(',')})`;
  let inserts: string[] = [];
  for (let i = 0; i < numberInserts; i++) {
    inserts.push(modelTemplate);
  }
  return inserts.join(',');
};

/**
 *
 * @param date Date | string - A data para ser formatada
 * @param isUtc boolean - pare trabalhar com Timezone UTC
 * @param format string - Ex. 'YYYY-MM-DD HH:mm:ss' or dddd, DD [de] MMMM [de] YYYY, HH:mm:ss
 */
export const formatDate = (
  date: Date | string,
  isUtc: boolean = true,
  format: string = 'DD/MM/YYYY',
) => {
  let utcDate = isUtc
    ? moment(moment.utc(date).format('YYYY-MM-DD HH:mm:ss'))
    : moment(moment(date).format('YYYY-MM-DD HH:mm:ss'));
  return moment(utcDate).format(format);
};

/**
 *
 * @param retunMode moment | string - moment = retorna classe moment, stirng = retorna string da data formatada
 * @param date string - A data para ser formatada
 * @param format string - Ex. 'YYYY-MM-DD HH:mm:ss' or 'dddd, DD [de] MMMM [de] YYYY, HH:mm:ss'
 */
export const newMoment = (
  retunMode: 'moment' | 'string' = 'string',
  date?: string,
  format: string = 'YYYY-MM-DD',
) => {
  let newDate = date
    ? moment(
        moment.utc(date).subtract(3, 'hours').format('YYYY-MM-DD HH:mm:ss'),
      )
    : moment.utc().subtract(3, 'hours');

  return retunMode == 'moment' ? newDate : newDate.format(format);
};

/**
 *
 * @param text  string - String para remover não numéricos
 * @param exceptions string - Caracteres a serem ignorados na remoção
 * @param replace string - String para ser colocada no lugar dos char não numéricos
 */
export const removeNonNumerical = (
  text: string,
  exceptions: string = '',
  replace: string = '',
) => {
  let regex = new RegExp('[^0-9' + exceptions + ']', 'g');
  return text.replace(regex, replace);
};

/**
 *
 * @param text  string - String para remover não alpha-numéricos
 * @param exceptions string - Caracteres a serem ignorados na remoção
 * @param replace string - String para ser colocada no lugar dos char não alpha-numéricos
 */
export const removeNonAlphanumeric = (
  text: string,
  exceptions: string = '',
  replace: string = '',
) => {
  let regex = new RegExp('[^a-zA-Z0-9' + exceptions + ']', 'g');
  return text.replace(regex, replace);
};

/**
 * Verifica se o "valueTosearch" se encontra em algum dos itens de "array", na chave "arraykey"
 *
 * @param {T[]} array - O array de elementos do tipo T.
 * @param {K} arrayKey - A chave dos elementos do array para a qual a verificação será realizada. Deve ser uma das chaves do tipo T.
 * @param {T[K]} valueToSearch - O valor que será comparado com o valor da chave especificada.
 * @returns {boolean} - Se existe ou não no array.
 *
 * @template T - O tipo dos elementos no array.
 * @template K - O tipo das chaves do objeto, garantido para ser uma chave de T.
 */
export const checkIfInArray = <T, K extends keyof T>(
  array: T[],
  arrayKey: K,
  valueToSearch: number | string,
): boolean => {
  return array.some(item => item[arrayKey] == valueToSearch);
};

/**
 * Encontra e retorna o primeiro item de um array que corresponde ao valor dado para uma chave específica.
 *
 * @param {T[]} array - O array de elementos do tipo T.
 * @param {K} arrayKey - A chave dos elementos do array para a qual a verificação será realizada. Deve ser uma das chaves do tipo T.
 * @param {T[K]} valueToSearch - O valor que será comparado com o valor da chave especificada.
 * @returns {T | undefined} Retorna o elemento correspondente se encontrado, ou undefined se nenhum elemento corresponder.
 *
 * @template T - O tipo dos elementos no array.
 * @template K - O tipo das chaves do objeto, garantido para ser uma chave de T.
 */
export const findInArray = <T, K extends keyof T>(
  array: T[],
  arrayKey: K,
  valueToSearch: number | string,
): T | undefined => {
  return array.find(item => item[arrayKey] == valueToSearch);
};

/**
 * Converte a query string em um objeto.
 * EX. url = "https://www.meusite.com?chave=001&tipo=publica"
 * Ex. retorno = { chave: '001', tipo: 'publica'}
 * @param url string - A url contendo os parâmetros
 * @returns Object - Um objeto com chave e valor referentes query string da url
 * OBS: a função não está preparada para receber urls com parâmentros que seja um array
 */
export const splitUrlParameters = (url: string): any => {
  let retorno: any = {};
  try {
    if (url.includes('?')) {
      let params = url.split('?');
      let indexLasItem = params.length - 1;

      let urlParams = params[indexLasItem].split('&');
      urlParams.forEach(param => {
        let keyAndValue = param.split('=');
        retorno[keyAndValue[0]] = keyAndValue[1];
      });
    }
  } catch (e) {
    console.error('src/utils.splitUrlParameters() ->', e);
  }
  return retorno;
};

/**
 * OBS: Padrão definido de acordo com o response padrão do laravel - projeto softsul-web
 * @param method AxiosMethod - metódo da requisição em string
 * @param endpoint string - endpoint do envio da requisição
 * @param config any - objeto com configs axios da requisição
 * @param body any - body da request a ser enviado
 * @param logContext  string - descricao do local da chamda para criar logs, em caso de falha
 * @param errorMessagePrefix string - Prefixo da mensagem de erro a ser exibida ao usuário. EX.'Falha ao buscar Item.'
 *  * @param LoggerClass classe para armazenar os logs
 * @returns {AxiosSuccessResponse | AxiosErrorResponse}
 */
export const axiosCallWithLog = async (
  method: AxiosMethod,
  endpoint: string,
  config: any = {},
  body: any = undefined,
  logContext: string = 'utils.axiosCallWithLog()',
  errorMessagePrefix: string = 'Falha em requisição.',
): Promise<AxiosSuccessResponse | AxiosErrorResponse> => {
  try {
    const axiosMethod = axiosMethods[method];

    let response: AxiosResponse;
    if (method === 'post' || method === 'put') {
      response = await axiosMethod(endpoint, body, config);
    } else {
      response = await axiosMethod(endpoint, config);
    }

    return handleAxiosSucceed(response);
  } catch (error) {
    let response = handleAxiosError(error);
    console.error(logContext + ' -->', JSON.stringify(response, null, 2));
    Snack('error', `${errorMessagePrefix} ${response.message}`);
    return response;
  }
};

/**
 * OBS: Padrão definido de acordo com o response padrão do laravel - projeto softsul-web
 * @param method AxiosMethod - metódo da requisição em string
 * @param endpoint string - endpoint do envio da requisição
 * @param config any - objeto com configs axios da requisição
 * @param body any - body da request a ser enviado
 */
export const axiosCall = async (
  method: AxiosMethod,
  endpoint: string,
  config: any = {},
  body: any = undefined,
): Promise<AxiosSuccessResponse | AxiosErrorResponse> => {
  try {
    const axiosMethod = axiosMethods[method];
    let response: AxiosResponse;
    if (method === 'post' || method === 'put') {
      response = await axiosMethod(endpoint, body, config);
    } else {
      response = await axiosMethod(endpoint, config);
    }
    return handleAxiosSucceed(response);
  } catch (error) {
    let response = handleAxiosError(error);
    console.error('utils.axiosCall() -->', JSON.stringify(response, null, 2));
    Snack('error', `Falha em requisição. ${response.message}`);
    return response;
  }
};

/**
 * OBS: Padrão definido de acordo com o response padrão do laravel - projeto softsul-web
 * @param response
 * @returns AxiosSuccessResponse
 */
export const handleAxiosSucceed = (response: any): AxiosSuccessResponse => {
  return {
    success: true,
    message: response.data?.message,
    data: response.data.data,
    status: response.status,
  };
};

/**
 * OBS: Padrão definido de acordo com o response padrão do laravel - projeto softsul-web
 * @param error
 * @returns AxiosSuccessResponse
 */
export const handleAxiosError = (error: any): AxiosErrorResponse => {
  try {
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message,
        data: error.response.data?.data,
        status: error.response.status,
        errors: error.response.data?.errors,
      };
    } else {
      return {
        success: false,
        message: error,
        data: [],
        status: error.status,
        errors: '',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error,
      data: [],
      status: error.status,
      errors: '',
    };
  }
};

export const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Geolocation Permission',
        message: 'Can we access your location?',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    return granted === 'granted';
  } catch (err) {
    console.error('src/utils.requestLocationPermission() ->', err);
    return false;
  }
};
