import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Motor Java da Calculadora Avançada de Investimentos com comparação
 * FGTS conservador x saque-aniversário reinvestido.
 *
 * A interface atual do celular é uma PWA em JavaScript; esta classe mantém uma
 * implementação Java equivalente para futura migração Android/nativa e para
 * validação independente das regras financeiras.
 */
public final class InvestmentFgtsCalculator {

    public record Params(
            double initialInvestment,
            double monthlyContribution,
            double portfolioAnnualRatePct,
            double inflationAnnualPct,
            int periodMonths,
            double thirteenthTotal,
            int thirteenthFirstMonth,
            double thirteenthFirstPct,
            int thirteenthSecondMonth,
            double thirteenthSecondPct,
            double plrFirstValue,
            int plrFirstMonth,
            double plrSecondValue,
            int plrSecondMonth,
            double fgtsInitialBalance,
            double fgtsAnnualRatePct,
            int birthdayMonth
    ) {}

    private static final class Lot {
        final double principal;
        double value;
        final int contributionMonth;
        Lot(double principal, int month) {
            this.principal = principal;
            this.value = principal;
            this.contributionMonth = month;
        }
    }

    public record ScenarioResult(
            double totalUserContributed,
            double totalFgtsInjected,
            double fgtsRemaining,
            double portfolioGross,
            double irWithheld,
            double portfolioNet,
            double consolidatedTotal,
            double realConsolidatedTotal
    ) {}

    public record MonthRow(
            int month,
            int simulationYear,
            int monthOfYear,
            double userContribution,
            double thirteenth,
            double plr,
            double fgtsWithdrawalB,
            double fgtsA,
            double fgtsB,
            double portfolioNetA,
            double portfolioNetB,
            double consolidatedA,
            double consolidatedB,
            double realA,
            double realB
    ) {}

    public record Result(
            ScenarioResult scenarioA,
            ScenarioResult scenarioB,
            double deltaValue,
            double deltaPct,
            double portfolioRealRatePct,
            double fgtsRealRatePct,
            List<MonthRow> rows
    ) {}

    private record Snapshot(double gross, double principal, double tax, double net) {}

    private InvestmentFgtsCalculator() {}

    public static double annualToMonthlyRate(double annualPct) {
        if (annualPct <= -100.0) throw new IllegalArgumentException("Taxa anual precisa ser maior que -100%.");
        return Math.pow(1.0 + annualPct / 100.0, 1.0 / 12.0) - 1.0;
    }

    public static double fixedIncomeIrRate(int holdingMonths) {
        int months = Math.max(0, holdingMonths);
        if (months <= 6) return 0.225;
        if (months <= 12) return 0.20;
        if (months <= 24) return 0.175;
        return 0.15;
    }

    public static double fgtsBirthdayWithdrawal(double balance) {
        double b = Math.max(0.0, balance);
        if (b <= 500.00) return Math.min(b, b * 0.50);
        if (b <= 1_000.00) return Math.min(b, b * 0.40 + 50.00);
        if (b <= 5_000.00) return Math.min(b, b * 0.30 + 150.00);
        if (b <= 10_000.00) return Math.min(b, b * 0.20 + 650.00);
        if (b <= 15_000.00) return Math.min(b, b * 0.15 + 1_150.00);
        if (b <= 20_000.00) return Math.min(b, b * 0.10 + 1_900.00);
        return Math.min(b, b * 0.05 + 2_900.00);
    }

    public static double fisherRealRate(double nominalPct, double inflationPct) {
        if (inflationPct <= -100.0) throw new IllegalArgumentException("Inflação precisa ser maior que -100%.");
        return ((1.0 + nominalPct / 100.0) / (1.0 + inflationPct / 100.0) - 1.0) * 100.0;
    }

    private static void validate(Params p) {
        if (p.periodMonths() < 1 || p.periodMonths() > 1200) throw new IllegalArgumentException("Período deve ficar entre 1 e 1200 meses.");
        if (p.initialInvestment() < 0 || p.monthlyContribution() < 0 || p.thirteenthTotal() < 0 ||
                p.plrFirstValue() < 0 || p.plrSecondValue() < 0 || p.fgtsInitialBalance() < 0) {
            throw new IllegalArgumentException("Valores de aporte e saldos não podem ser negativos.");
        }
        if (Math.abs(p.thirteenthFirstPct() + p.thirteenthSecondPct() - 100.0) > 1e-9) {
            throw new IllegalArgumentException("As duas parcelas do 13º precisam somar 100%.");
        }
        int[] months = {p.thirteenthFirstMonth(), p.thirteenthSecondMonth(), p.plrFirstMonth(), p.plrSecondMonth(), p.birthdayMonth()};
        for (int m : months) if (m < 1 || m > 12) throw new IllegalArgumentException("Meses devem ficar entre 1 e 12.");
        annualToMonthlyRate(p.portfolioAnnualRatePct());
        annualToMonthlyRate(p.fgtsAnnualRatePct());
        annualToMonthlyRate(p.inflationAnnualPct());
    }

    private static Snapshot snapshot(List<Lot> lots, int currentMonth) {
        double gross = 0.0, principal = 0.0, tax = 0.0;
        for (Lot lot : lots) {
            gross += lot.value;
            principal += lot.principal;
            double gain = Math.max(0.0, lot.value - lot.principal);
            tax += gain * fixedIncomeIrRate(Math.max(0, currentMonth - lot.contributionMonth));
        }
        return new Snapshot(gross, principal, tax, gross - tax);
    }

    private static void addLot(List<Lot> lots, double amount, int month) {
        if (amount > 0.0) lots.add(new Lot(amount, month));
    }

    public static Result simulate(Params p) {
        validate(p);
        double portfolioMonthly = annualToMonthlyRate(p.portfolioAnnualRatePct());
        double fgtsMonthly = annualToMonthlyRate(p.fgtsAnnualRatePct());
        double inflationMonthly = annualToMonthlyRate(p.inflationAnnualPct());

        List<Lot> lotsA = new ArrayList<>();
        List<Lot> lotsB = new ArrayList<>();
        addLot(lotsA, p.initialInvestment(), 0);
        addLot(lotsB, p.initialInvestment(), 0);

        double fgtsA = p.fgtsInitialBalance();
        double fgtsB = p.fgtsInitialBalance();
        double totalUser = p.initialInvestment();
        double fgtsInjected = 0.0;
        List<MonthRow> rows = new ArrayList<>();

        for (int month = 1; month <= p.periodMonths(); month++) {
            int moy = (month - 1) % 12 + 1;
            int year = (month - 1) / 12 + 1;

            for (Lot lot : lotsA) lot.value *= 1.0 + portfolioMonthly;
            for (Lot lot : lotsB) lot.value *= 1.0 + portfolioMonthly;
            fgtsA *= 1.0 + fgtsMonthly;
            fgtsB *= 1.0 + fgtsMonthly;

            double th = 0.0;
            if (moy == p.thirteenthFirstMonth()) th += p.thirteenthTotal() * p.thirteenthFirstPct() / 100.0;
            if (moy == p.thirteenthSecondMonth()) th += p.thirteenthTotal() * p.thirteenthSecondPct() / 100.0;
            double plr = 0.0;
            if (moy == p.plrFirstMonth()) plr += p.plrFirstValue();
            if (moy == p.plrSecondMonth()) plr += p.plrSecondValue();

            totalUser += p.monthlyContribution() + th + plr;
            for (List<Lot> lots : List.of(lotsA, lotsB)) {
                addLot(lots, p.monthlyContribution(), month);
                addLot(lots, th, month);
                addLot(lots, plr, month);
            }

            double fgtsWithdrawal = 0.0;
            if (moy == p.birthdayMonth() && fgtsB > 0.005) {
                fgtsWithdrawal = fgtsBirthdayWithdrawal(fgtsB);
                fgtsB -= fgtsWithdrawal;
                fgtsInjected += fgtsWithdrawal;
                addLot(lotsB, fgtsWithdrawal, month);
            }

            Snapshot a = snapshot(lotsA, month);
            Snapshot b = snapshot(lotsB, month);
            double consolidatedA = a.net() + fgtsA;
            double consolidatedB = b.net() + fgtsB;
            double inflationFactor = Math.pow(1.0 + inflationMonthly, month);
            rows.add(new MonthRow(month, year, moy, p.monthlyContribution(), th, plr, fgtsWithdrawal,
                    fgtsA, fgtsB, a.net(), b.net(), consolidatedA, consolidatedB,
                    consolidatedA / inflationFactor, consolidatedB / inflationFactor));
        }

        Snapshot a = snapshot(lotsA, p.periodMonths());
        Snapshot b = snapshot(lotsB, p.periodMonths());
        double totalA = a.net() + fgtsA;
        double totalB = b.net() + fgtsB;
        double inflationFactor = Math.pow(1.0 + p.inflationAnnualPct() / 100.0, p.periodMonths() / 12.0);
        ScenarioResult scenarioA = new ScenarioResult(totalUser, 0.0, fgtsA, a.gross(), a.tax(), a.net(), totalA, totalA / inflationFactor);
        ScenarioResult scenarioB = new ScenarioResult(totalUser, fgtsInjected, fgtsB, b.gross(), b.tax(), b.net(), totalB, totalB / inflationFactor);
        double delta = totalB - totalA;
        double deltaPct = Math.abs(totalA) > 1e-12 ? delta / totalA * 100.0 : 0.0;
        return new Result(scenarioA, scenarioB, delta, deltaPct,
                fisherRealRate(p.portfolioAnnualRatePct(), p.inflationAnnualPct()),
                fisherRealRate(p.fgtsAnnualRatePct(), p.inflationAnnualPct()), rows);
    }

    public static String toCsv(Result r) {
        StringBuilder out = new StringBuilder("mes;ano;mes_do_ano;aporte_usuario;13o;plr;saque_fgts_b;fgts_a;fgts_b;carteira_liquida_a;carteira_liquida_b;patrimonio_a;patrimonio_b;real_a;real_b\n");
        for (MonthRow x : r.rows()) {
            out.append(String.format(Locale.US,
                    "%d;%d;%d;%.2f;%.2f;%.2f;%.2f;%.2f;%.2f;%.2f;%.2f;%.2f;%.2f;%.2f;%.2f%n",
                    x.month(), x.simulationYear(), x.monthOfYear(), x.userContribution(), x.thirteenth(), x.plr(),
                    x.fgtsWithdrawalB(), x.fgtsA(), x.fgtsB(), x.portfolioNetA(), x.portfolioNetB(),
                    x.consolidatedA(), x.consolidatedB(), x.realA(), x.realB()));
        }
        return out.toString();
    }

    public static void main(String[] args) {
        Params p = new Params(1000, 500, 10, 4.5, 120,
                3000, 11, 50, 12, 50,
                1000, 3, 1000, 9,
                10000, 3, 3);
        Result r = simulate(p);
        ScenarioResult a = r.scenarioA();
        ScenarioResult b = r.scenarioB();
        System.out.println("\nCOMPARAÇÃO FGTS x REINVESTIMENTO");
        System.out.printf("%-34s %15s %15s %15s%n", "Métrica", "Cenário A", "Cenário B", "Delta B-A");
        printRow("Total aportado pelo usuário", a.totalUserContributed(), b.totalUserContributed());
        printRow("Total injetado do FGTS", a.totalFgtsInjected(), b.totalFgtsInjected());
        printRow("Saldo FGTS restante", a.fgtsRemaining(), b.fgtsRemaining());
        printRow("Carteira bruta", a.portfolioGross(), b.portfolioGross());
        printRow("IR retido estimado", a.irWithheld(), b.irWithheld());
        printRow("Carteira líquida", a.portfolioNet(), b.portfolioNet());
        printRow("Patrimônio total consolidado", a.consolidatedTotal(), b.consolidatedTotal());
        printRow("Patrimônio real", a.realConsolidatedTotal(), b.realConsolidatedTotal());
        System.out.printf(Locale.US, "%nDelta consolidado: R$ %.2f (%.2f%%)%n", r.deltaValue(), r.deltaPct());
        System.out.printf(Locale.US, "Taxa real da carteira (Fisher): %.2f%% a.a.%n", r.portfolioRealRatePct());
    }

    private static void printRow(String label, double a, double b) {
        System.out.printf(Locale.US, "%-34s R$ %12.2f R$ %12.2f R$ %12.2f%n", label, a, b, b - a);
    }
}
