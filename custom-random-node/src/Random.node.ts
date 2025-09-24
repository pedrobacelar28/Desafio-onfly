
import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';

export class Random implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Random',
    name: 'random',
    icon: 'file:icons/random.svg',
    group: ['transform'],
    version: 1,
    description: 'True Random Number Generator (random.org)',
    defaults: {
      name: 'Random',
    },
    inputs: ['main'],
    outputs: ['main'],
    // uma única operação
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        default: 'trueRandomNumber',
        options: [
          {
            name: 'True Random Number Generator',
            value: 'trueRandomNumber',
            description: 'Gera 1 número inteiro aleatório entre Min e Max (inclusivos) usando random.org',
          },
        ],
      },
      // parâmetros da operação
      {
        displayName: 'Min',
        name: 'min',
        type: 'number',
        typeOptions: {
          minValue: -1_000_000_000,
          maxValue: 1_000_000_000,
          numberPrecision: 0,
        },
        default: 1,
        required: true,
        description: 'Menor valor inteiro possível (inclusivo)',
        displayOptions: { show: { operation: ['trueRandomNumber'] } },
      },
      {
        displayName: 'Max',
        name: 'max',
        type: 'number',
        typeOptions: {
          minValue: -1_000_000_000,
          maxValue: 1_000_000_000,
          numberPrecision: 0,
        },
        default: 100,
        required: true,
        description: 'Maior valor inteiro possível (inclusivo)',
        displayOptions: { show: { operation: ['trueRandomNumber'] } },
      },
    ],
  };

  // n8n chamará isso quando o node executar
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();

    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const min = this.getNodeParameter('min', i) as number;
      const max = this.getNodeParameter('max', i) as number;

      if (!Number.isInteger(min) || !Number.isInteger(max)) {
        throw new Error('Min e Max devem ser inteiros.');
      }
      if (min > max) {
        throw new Error('Min não pode ser maior que Max.');
      }

      // monta a URL exatamente como exigido no enunciado
      const url = `https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`;

      // peça o corpo completo (full response), pq algumas versões retornam objeto
      const resp = await this.helpers.httpRequest({
        method: 'GET',
        url,
        json: false,
        // importante: com full response garantimos que resp.body existe
        returnFullResponse: true as unknown as boolean, // cast pra evitar ruído de tipos
      } as any);

      // normaliza para string independente do que vier (objeto, buffer ou string)
      const bodyRaw = (resp && typeof resp === 'object' && 'body' in resp) ? (resp as any).body : resp;

      const valueStr =
        Buffer.isBuffer(bodyRaw) ? bodyRaw.toString('utf8').trim()
        : typeof bodyRaw === 'string' ? bodyRaw.trim()
        : String(bodyRaw).trim();

      const value = Number.parseInt(valueStr, 10);

      if (!Number.isInteger(value)) {
        throw new Error(`Resposta inesperada do random.org: "${valueStr}"`);
      }

      returnData.push({
        json: {
          min,
          max,
          value,
          source: 'random.org',
        },
      });
    }

    return [returnData];
  }
}
