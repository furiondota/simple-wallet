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

;; Check balance
(define-read-only (get-balance (user principal))
  (default-to u0 (get amount (map-get? balances { user }))))
