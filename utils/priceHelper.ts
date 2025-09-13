export class PriceHelper {
    static toCents(priceInReais: number): number {
        return Math.round(priceInReais * 100);
    }

    static toReais(priceInCents: number): number {
        return priceInCents / 100;
    }

    static format(priceInCents: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(priceInCents / 100);
    }
}