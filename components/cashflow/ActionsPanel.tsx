import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Props = {
  isCreator: boolean;
  isFuji: boolean;
  onApproveVault: () => void;
  onDeposit: () => void;
  onRedeem: () => void;
  onMaxRedeem: () => void;
  onApproveSchedule: () => void;
  onPay: () => void;
  depositAmount: string;
  setDepositAmount: (v: string) => void;
  redeemShares: string;
  setRedeemShares: (v: string) => void;
};

export function ActionsPanel(props: Props) {
  return (
    <Card>
      <CardContent className="space-y-5">
        <div>
          <h3 className="text-lg font-semibold">Actions</h3>
          <p className="text-xs text-slate-400">Approve, deposit, redeem, and trigger scheduled cashflow payments.</p>
        </div>

        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={props.onApproveVault} disabled={!props.isFuji}>Approve USDC → Vault</Button>
          <div className="flex gap-2">
            <Input placeholder="Deposit USDC" value={props.depositAmount} onChange={(e) => props.setDepositAmount(e.target.value)} />
            <Button onClick={props.onDeposit} disabled={!props.isFuji}>Deposit</Button>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Redeem shares" value={props.redeemShares} onChange={(e) => props.setRedeemShares(e.target.value)} />
            <Button onClick={props.onRedeem} disabled={!props.isFuji}>Redeem</Button>
          </div>
          <Button variant="ghost" className="w-full" onClick={props.onMaxRedeem}>Max redeem</Button>
        </div>

        <div className="border-t border-white/10 pt-4 space-y-2">
          <Button variant="outline" className="w-full" onClick={props.onApproveSchedule} disabled={!props.isFuji}>Approve USDC → Schedule</Button>
          <Button className="w-full" onClick={props.onPay} disabled={!props.isFuji || !props.isCreator}>Pay()</Button>
          {!props.isCreator && <p className="text-xs text-amber-300">Only schedule creator can call pay().</p>}
        </div>
      </CardContent>
    </Card>
  );
}
