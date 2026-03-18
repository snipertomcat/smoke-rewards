import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, User, Award, Flame, Save, Info } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../api/client'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

// ─── schema ──────────────────────────────────────────────────────────────────

const rewardsSchema = z.object({
  points_per_dollar:      z.coerce.number().int().min(1, 'Must be at least 1'),
  min_redemption_points:  z.coerce.number().int().min(1, 'Must be at least 1'),
  points_to_dollar_ratio: z.coerce.number().min(0.01, 'Must be greater than 0'),
})

type RewardsFormValues = z.infer<typeof rewardsSchema>

// ─── SettingRow (read-only display) ──────────────────────────────────────────

function SettingRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="text-sm font-medium text-gray-900 text-right">{value}</div>
    </div>
  )
}

// ─── RewardsConfigForm ────────────────────────────────────────────────────────

function RewardsConfigForm() {
  const { user, refreshUser } = useAuth()
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const settings = user?.tenant?.settings ?? {}
  const defaultValues: RewardsFormValues = {
    points_per_dollar:      (settings.points_per_dollar      as number) ?? 1,
    min_redemption_points:  (settings.min_redemption_points  as number) ?? 100,
    points_to_dollar_ratio: (settings.points_to_dollar_ratio as number) ?? 0.20,
  }

  const { register, handleSubmit, watch, formState: { errors, isSubmitting, isDirty } } = useForm<RewardsFormValues>({
    resolver: zodResolver(rewardsSchema),
    defaultValues,
  })

  const watchedRatio = watch('points_to_dollar_ratio')
  const watchedPPD   = watch('points_per_dollar')
  // How much a point is worth in dollars
  const pointValue   = Number(watchedRatio) || 0
  // How many points needed for $1 in rewards
  const pointsPerDollarReward = pointValue > 0 ? Math.ceil(1 / pointValue) : '—'
  // How many dollars to spend to earn $1 in rewards (earn rate × point value)
  const dollarSpendFor1Reward = pointValue > 0 && Number(watchedPPD) > 0
    ? (1 / (Number(watchedPPD) * pointValue)).toFixed(2)
    : '—'

  const onSubmit = async (data: RewardsFormValues) => {
    setServerError(null)
    setSaved(false)
    try {
      await apiClient.put('/settings', data)
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })?.response
      const msg = resp?.data?.errors ? Object.values(resp.data.errors).flat()[0] : resp?.data?.message
      setServerError(msg ?? 'Failed to save settings.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{serverError}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Points Earned Per $1 Spent"
          type="number"
          min={1}
          step={1}
          error={errors.points_per_dollar?.message}
          {...register('points_per_dollar')}
        />
        <Input
          label="Minimum Redemption Points"
          type="number"
          min={1}
          step={1}
          error={errors.min_redemption_points?.message}
          {...register('min_redemption_points')}
        />
      </div>

      {/* Points-to-dollar ratio — display only, not used in calculations */}
      <div className="space-y-1">
        <Input
          label="Point Redemption Value ($ per point)"
          type="number"
          min={0.01}
          step={0.01}
          error={errors.points_to_dollar_ratio?.message}
          {...register('points_to_dollar_ratio')}
        />
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Info className="h-3.5 w-3.5 shrink-0" />
          Display-only reference — not used in any automatic calculation.
        </p>
      </div>

      {/* Live preview */}
      <div className="p-4 rounded-lg bg-brand-50 border border-brand-100 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="h-4 w-4 text-brand-500" />
          <p className="text-sm font-semibold text-brand-800">Rewards Summary</p>
        </div>
        <p className="text-sm text-brand-700">
          Customers earn <strong>{watchedPPD} pt{Number(watchedPPD) !== 1 ? 's' : ''}</strong> per <strong>$1</strong> spent.
        </p>
        <p className="text-sm text-brand-700">
          Each point is worth <strong>${Number(watchedRatio).toFixed(2)}</strong> in store credit
          &nbsp;(<strong>{pointsPerDollarReward} points = $1</strong> in merchandise).
        </p>
        <p className="text-sm text-brand-700">
          A customer must spend <strong>${dollarSpendFor1Reward}</strong> to earn <strong>$1</strong> in rewards.
        </p>
      </div>

      <div className="flex items-center justify-between pt-1">
        {saved ? (
          <span className="text-sm text-green-600 font-medium">Settings saved successfully.</span>
        ) : (
          <span />
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={!isDirty && !saved}
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </form>
  )
}

// ─── SettingsPage ─────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your store configuration and account details</p>
      </div>

      {/* Store Information */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 rounded-lg bg-brand-100 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-brand-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Store Information</h2>
        </div>
        <SettingRow label="Store Name" value={user?.tenant?.name ?? '—'} />
        <SettingRow
          label="Store Slug"
          value={
            <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">
              {user?.tenant?.slug ?? '—'}
            </span>
          }
        />
        <SettingRow label="Tenant ID" value={`#${user?.tenant?.id ?? '—'}`} />
      </Card>

      {/* Account */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">Account</h2>
        </div>
        <SettingRow label="Name"    value={user?.name ?? '—'} />
        <SettingRow label="Email"   value={user?.email ?? '—'} />
        <SettingRow label="Role"    value={<Badge variant="orange" className="capitalize">{user?.role ?? '—'}</Badge>} />
        <SettingRow label="User ID" value={`#${user?.id ?? '—'}`} />
      </Card>

      {/* Rewards Configuration */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Award className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Rewards Configuration</h2>
            {!isAdmin && (
              <p className="text-xs text-gray-400 mt-0.5">Contact your admin to change these settings.</p>
            )}
          </div>
        </div>

        {isAdmin ? (
          <RewardsConfigForm />
        ) : (
          <>
            <SettingRow
              label="Points Per Dollar"
              value={
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-brand-600">
                    {(user?.tenant?.settings?.points_per_dollar as number) ?? 1}
                  </span>
                  <span className="text-xs text-gray-500">pts / $1 spent</span>
                </div>
              }
            />
            <SettingRow
              label="Min. Redemption Points"
              value={(user?.tenant?.settings?.min_redemption_points as number) ?? 100}
            />
            <SettingRow
              label="Point Value"
              value={
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-brand-600">
                    ${Number((user?.tenant?.settings?.points_to_dollar_ratio as number) ?? 0.20).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">per point</span>
                </div>
              }
            />
          </>
        )}
      </Card>
    </div>
  )
}
