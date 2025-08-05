from flask import Blueprint, jsonify, request, session
from src.models.user import User, db, Transaction
from werkzeug.security import generate_password_hash, check_password_hash

user_bp = Blueprint("user", __name__)

# Credenciais do admin (em produção, isso deveria estar em um banco de dados com hash)
ADMIN_CREDENTIALS = {
    "email": "admin@admin.com",
    "password": "admin2025"
}

@user_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email").strip()
    password = data.get("password").strip()

    if not email or not password:
        return jsonify({"success": False, "message": "Email e senha são obrigatórios."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "Email já cadastrado."}), 409

    new_user = User(
        email=email,
        status="pending",
        full_name=data.get("full_name"),
        date_of_birth=data.get("date_of_birth"),
        gender=data.get("gender"),
        nationality=data.get("nationality"),
        naturalness=data.get("naturalness"),
        cpf=data.get("cpf"),
        rg_cnh_front=data.get("rg_cnh_front"),
        rg_cnh_back=data.get("rg_cnh_back"),
        selfie_with_doc=data.get("selfie_with_doc"),
        proof_of_residence=data.get("proof_of_residence"),
        occupation=data.get("occupation"),
        company_name=data.get("company_name"),
        monthly_income=data.get("monthly_income"),
        estimated_wealth=data.get("estimated_wealth"),
        source_of_income=data.get("source_of_income"),
        licit_resources_declaration=data.get("licit_resources_declaration", False),
        bank_name=data.get("bank_name"),
        bank_agency=data.get("bank_agency"),
        bank_account=data.get("bank_account"),
        account_type=data.get("account_type"),
        account_ownership=data.get("account_ownership"),
        investment_objective=data.get("investment_objective"),
        risk_tolerance=data.get("risk_tolerance"),
        investment_knowledge=data.get("investment_knowledge"),
        investment_types=data.get("investment_types"),
        terms_of_use_accepted=data.get("terms_of_use_accepted", False),
        privacy_policy_accepted=data.get("privacy_policy_accepted", False),
        lgpd_accepted=data.get("lgpd_accepted", False),
        marketing_consent=data.get("marketing_consent", False)
    )
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"success": True, "message": "Cadastro enviado para análise. Aguarde a aprovação."}), 201

@user_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("username", "").strip()  # Frontend envia como 'username' mas é email
    password = data.get("password", "").strip()
    
    # Verifica se é o admin
    if email == ADMIN_CREDENTIALS["email"] and password == ADMIN_CREDENTIALS["password"]:
        session["user_id"] = "admin"
        session["email"] = email
        session["is_admin"] = True
        return jsonify({"success": True, "message": "Login de admin realizado com sucesso", "user": {"email": email, "is_admin": True}}), 200

    # Verifica usuários normais
    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        if user.status == "approved":
            session["user_id"] = user.id
            session["email"] = user.email
            session["is_admin"] = False
            return jsonify({"success": True, "message": "Login realizado com sucesso", "user": user.to_dict()}), 200
        elif user.status == "pending":
            return jsonify({"success": False, "message": "Sua conta está pendente de aprovação."}), 403
        else: # rejected
            return jsonify({"success": False, "message": "Sua conta foi rejeitada. Entre em contato com o suporte."}), 403
    else:
        return jsonify({"success": False, "message": "Credenciais inválidas"}), 401

@user_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logout realizado com sucesso"}), 200

@user_bp.route("/check-auth", methods=["GET"])
def check_auth():
    if "user_id" in session:
        user_id = session["user_id"]
        if user_id == "admin":
            return jsonify({"authenticated": True, "user": {"email": session.get("email"), "is_admin": True}}), 200
        else:
            user = User.query.get(user_id)
            if user:
                return jsonify({"authenticated": True, "user": user.to_dict()}), 200
            else:
                session.clear() # Clear invalid session
                return jsonify({"authenticated": False}), 401
    else:
        return jsonify({"authenticated": False}), 401

@user_bp.route("/users", methods=["GET"])
def get_users():
    if session.get("is_admin"):
        users = User.query.all()
        return jsonify([user.to_dict() for user in users])
    return jsonify({"error": "Não autorizado"}), 401

@user_bp.route("/users/<int:user_id>/approve", methods=["POST"])
def approve_user(user_id):
    if session.get("is_admin"):
        user = User.query.get_or_404(user_id)
        user.status = "approved"
        db.session.commit()
        return jsonify({"success": True, "message": "Usuário aprovado com sucesso"}), 200
    return jsonify({"error": "Não autorizado"}), 401

@user_bp.route("/users/<int:user_id>/reject", methods=["POST"])
def reject_user(user_id):
    if session.get("is_admin"):
        user = User.query.get_or_404(user_id)
        user.status = "rejected"
        db.session.commit()
        return jsonify({"success": True, "message": "Usuário rejeitado com sucesso"}), 200
    return jsonify({"error": "Não autorizado"}), 401

@user_bp.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    if session.get("is_admin"):
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return "", 204
    return jsonify({"error": "Não autorizado"}), 401





@user_bp.route("/deposit", methods=["POST"])
def deposit():
    if "user_id" not in session or session["user_id"] == "admin":
        return jsonify({"error": "Não autorizado"}), 401
    
    data = request.json
    amount = data.get("amount")

    if not amount or not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({"success": False, "message": "Valor de depósito inválido."}), 400

    new_transaction = Transaction(
        user_id=session["user_id"],
        type="deposit",
        amount=amount,
        status="pending"
    )
    db.session.add(new_transaction)
    db.session.commit()

    return jsonify({"success": True, "message": "Solicitação de depósito enviada para análise."}), 201

@user_bp.route("/withdraw", methods=["POST"])
def withdraw():
    if "user_id" not in session or session["user_id"] == "admin":
        return jsonify({"error": "Não autorizado"}), 401
    
    data = request.json
    amount = data.get("amount")

    if not amount or not isinstance(amount, (int, float)) or amount <= 0:
        return jsonify({"success": False, "message": "Valor de saque inválido."}), 400

    new_transaction = Transaction(
        user_id=session["user_id"],
        type="withdrawal",
        amount=amount,
        status="pending"
    )
    db.session.add(new_transaction)
    db.session.commit()

    return jsonify({"success": True, "message": "Solicitação de saque enviada para análise."}), 201

@user_bp.route("/transactions", methods=["GET"])
def get_transactions():
    if "user_id" not in session:
        return jsonify({"error": "Não autorizado"}), 401
    
    if session["user_id"] == "admin":
        transactions = Transaction.query.all()
    else:
        transactions = Transaction.query.filter_by(user_id=session["user_id"]).all()
    
    return jsonify([t.to_dict() for t in transactions]), 200

@user_bp.route("/transactions/<int:transaction_id>/approve", methods=["POST"])
def approve_transaction(transaction_id):
    if not session.get("is_admin"):
        return jsonify({"error": "Não autorizado"}), 401
    
    transaction = Transaction.query.get_or_404(transaction_id)
    transaction.status = "approved"
    transaction.approval_date = db.func.current_timestamp()
    db.session.commit()
    return jsonify({"success": True, "message": "Transação aprovada com sucesso"}), 200

@user_bp.route("/transactions/<int:transaction_id>/reject", methods=["POST"])
def reject_transaction(transaction_id):
    if not session.get("is_admin"):
        return jsonify({"error": "Não autorizado"}), 401
    
    transaction = Transaction.query.get_or_404(transaction_id)
    transaction.status = "rejected"
    transaction.approval_date = db.func.current_timestamp()
    db.session.commit()
    return jsonify({"success": True, "message": "Transação rejeitada com sucesso"}), 200


