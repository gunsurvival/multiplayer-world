import { reservedKeys } from '@/shared/reservedKeys'
import { ArraySchema } from '@/schema/ArraySchema';
import { MapSchema } from '@/schema/MapSchema';
import { Schema } from '@/schema/Schema';
import { SchemaType } from '@/types/SchemaType'
import { waitFor } from './waitFor';


export function isSchemaType(value: any): value is SchemaType {
  return (
    value instanceof Schema ||
    value instanceof MapSchema ||
    value instanceof ArraySchema
  );
}

export function pairClientServer(
  clientObject: any,
  serverObject: any,
  holderMap: Map<number, Schema>
) {
  setTimeout(() => {
    // wait to see if any max exceed error
    if (clientObject instanceof MapSchema) {
      (serverObject as MapSchema).onAdd((item, key) => {
        waitFor(() => clientObject.has(key), {
          waitForWhat: `clientObject#${clientObject?.constructor?.name}.has(${key})`,
          timeoutMs: 5000,
        })
          .then(() => {
            // TODO: should implement onAdd for clientObject for O(1)
            pairClientServer(clientObject.get(key), item, holderMap);
          })
          .catch(console.error);
      });
      clientObject.forEach((value, key) => {
        pairClientServer(value, serverObject.get(key), holderMap);
      });
    } else if (clientObject instanceof ArraySchema) {
      (serverObject as ArraySchema).onAdd((item, index) => {
        waitFor(() => clientObject[index], {
          waitForWhat: `clientObject#${clientObject?.constructor?.name}[${index}]`,
          timeoutMs: 5000,
        })
          .then(() => {
            pairClientServer(clientObject[index], item, holderMap);
          })
          .catch(console.error);
      });

      clientObject.forEach((value, index) => {
        pairClientServer(value, serverObject[index], holderMap);
      });
    } else if (clientObject instanceof Schema) {
      Object.keys(clientObject)
        .filter((k) => !reservedKeys.includes(k))
        .forEach((key) => {
          if (serverObject?.[key]) {
            // @ts-ignore
            pairClientServer(clientObject[key], serverObject[key], holderMap);
          }
        });
    } else if (typeof clientObject === 'object') {
      Object.keys(clientObject)
        .filter(
          (k) =>
            !reservedKeys.includes(k) &&
            isSchemaType(clientObject[k]) &&
            isSchemaType(serverObject?.[k])
        )
        .forEach((key) => {
          pairClientServer(clientObject[key], serverObject[key], holderMap);
        });
    }

    if (clientObject?.id && serverObject?.id) {
      holderMap.set(serverObject.id, clientObject);
      (serverObject as Schema).listen('id', (value) => {
        clientObject.id = value;
      });
      clientObject.serverState = serverObject;
    }
  });
}

export type MethodKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];
