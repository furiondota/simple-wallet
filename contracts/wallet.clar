;; Simple Wallet Contract

(define-map balances { user: principal } { amount: uint })

;; Deposit funds
(define-public (deposit (amount uint))
  (let ((current (default-to u0 (get amount (map-get? balances { user: tx-sender })))))
    (map-set balances { user: tx-sender } { amount: (+ current amount) })
    (ok "Deposited")
  )
)

;; Withdraw funds
(define-public (withdraw (amount uint))
  (let ((current (default-to u0 (get amount (map-get? balances { user: tx-sender })))))
    (if (>= current amount)
        (begin
          (map-set balances { user: tx-sender } { amount: (- current amount) })
          (ok "Withdrawn")
        )
        (err u101)
    )
  )
)

;; Transfer funds to another user
(define-public (transfer (to principal) (amount uint))
  (let (
      (sender-balance (default-to u0 (get amount (map-get? balances { user: tx-sender }))))
      (recipient-balance (default-to u0 (get amount (map-get? balances { user: to }))))
    )
    (if (>= sender-balance amount)
        (begin
          (map-set balances { user: tx-sender } { amount: (- sender-balance amount) })
          (map-set balances { user: to } { amount: (+ recipient-balance amount) })
          (ok "Transferred")
        )
        (err u101)
    )
  )
)

;; Check balance
(define-read-only (get-balance (user principal))
  (default-to u0 (get amount (map-get? balances { user }))))
