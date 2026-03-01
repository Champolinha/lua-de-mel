import { useMemo } from 'react';
import { extractFloat } from '../utils/numbers';

export default function useCosts(data) {
    return useMemo(() => {
        let totalBudget = 0;
        let totalSpent = 0;
        let remainingFunds = 0;
        const breakdowns = [];

        if (data?.custos && data.custos.length > 0) {
            const totalsRow = data.custos[0];
            if (totalsRow.length >= 3) {
                totalSpent = extractFloat(totalsRow[1]);
                remainingFunds = extractFloat(totalsRow[2]);
                totalBudget = totalSpent + remainingFunds;
            }

            for (let i = 1; i < data.custos.length; i++) {
                const row = data.custos[i];
                if (row[0]) {
                    breakdowns.push({ category: row[0], amount: extractFloat(row[1]) });
                }
            }
        }

        const extraCosts = data?.custosExtras || [];
        let totalExtra = 0;

        extraCosts.forEach(ec => {
            const val = extractFloat(ec.Valor);
            totalExtra += val;
            const exists = breakdowns.find(b => b.category === (ec.Categoria || 'Outros'));
            if (exists) {
                exists.amount += val;
            } else {
                breakdowns.push({ category: ec.Categoria || 'Outros', amount: val });
            }
        });

        totalSpent += totalExtra;
        remainingFunds -= totalExtra;
        const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        return {
            totalBudget,
            totalSpent,
            remainingFunds,
            spentPercentage,
            breakdowns,
            extraCosts
        };
    }, [data?.custos, data?.custosExtras]);
}
