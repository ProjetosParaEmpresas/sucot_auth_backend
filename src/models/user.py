from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(50), default='pending') # pending, approved, rejected

    # 1. Dados Pessoais
    full_name = db.Column(db.String(100), nullable=True)
    date_of_birth = db.Column(db.String(10), nullable=True) # YYYY-MM-DD
    gender = db.Column(db.String(10), nullable=True)
    nationality = db.Column(db.String(50), nullable=True)
    naturalness = db.Column(db.String(50), nullable=True)

    # 2. Documentos de Identificação
    cpf = db.Column(db.String(14), unique=True, nullable=True)
    rg_cnh_front = db.Column(db.String(255), nullable=True) # path to image
    rg_cnh_back = db.Column(db.String(255), nullable=True)  # path to image
    selfie_with_doc = db.Column(db.String(255), nullable=True) # path to image
    proof_of_residence = db.Column(db.String(255), nullable=True) # path to image

    # 3. Informações Financeiras
    occupation = db.Column(db.String(100), nullable=True)
    company_name = db.Column(db.String(100), nullable=True)
    monthly_income = db.Column(db.Float, nullable=True)
    estimated_wealth = db.Column(db.Float, nullable=True)
    source_of_income = db.Column(db.String(100), nullable=True)
    licit_resources_declaration = db.Column(db.Boolean, default=False)

    # 4. Informações Bancárias
    bank_name = db.Column(db.String(100), nullable=True)
    bank_agency = db.Column(db.String(20), nullable=True)
    bank_account = db.Column(db.String(20), nullable=True)
    account_type = db.Column(db.String(20), nullable=True) # current or savings
    account_ownership = db.Column(db.String(20), nullable=True) # own or third_party

    # 6. Perfil do Cliente (Suitability)
    investment_objective = db.Column(db.String(50), nullable=True) # short, medium, long
    risk_tolerance = db.Column(db.String(50), nullable=True) # low, medium, high
    investment_knowledge = db.Column(db.String(50), nullable=True) # beginner, intermediate, advanced
    investment_types = db.Column(db.String(255), nullable=True) # comma separated values

    # 7. Consentimentos e Termos
    terms_of_use_accepted = db.Column(db.Boolean, default=False)
    privacy_policy_accepted = db.Column(db.Boolean, default=False)
    lgpd_accepted = db.Column(db.Boolean, default=False)
    marketing_consent = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.email}>'

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'is_admin': self.is_admin,
            'status': self.status,
            'full_name': self.full_name,
            'date_of_birth': self.date_of_birth,
            'gender': self.gender,
            'nationality': self.nationality,
            'naturalness': self.naturalness,
            'cpf': self.cpf,
            'rg_cnh_front': self.rg_cnh_front,
            'rg_cnh_back': self.rg_cnh_back,
            'selfie_with_doc': self.selfie_with_doc,
            'proof_of_residence': self.proof_of_residence,
            'occupation': self.occupation,
            'company_name': self.company_name,
            'monthly_income': self.monthly_income,
            'estimated_wealth': self.estimated_wealth,
            'source_of_income': self.source_of_income,
            'licit_resources_declaration': self.licit_resources_declaration,
            'bank_name': self.bank_name,
            'bank_agency': self.bank_agency,
            'bank_account': self.bank_account,
            'account_type': self.account_type,
            'account_ownership': self.account_ownership,
            'investment_objective': self.investment_objective,
            'risk_tolerance': self.risk_tolerance,
            'investment_knowledge': self.investment_knowledge,
            'investment_types': self.investment_types,
            'terms_of_use_accepted': self.terms_of_use_accepted,
            'privacy_policy_accepted': self.privacy_policy_accepted,
            'lgpd_accepted': self.lgpd_accepted,
            'marketing_consent': self.marketing_consent
        }




class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(10), nullable=False) # 'deposit' or 'withdrawal'
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='pending') # pending, approved, rejected
    request_date = db.Column(db.DateTime, default=db.func.current_timestamp())
    approval_date = db.Column(db.DateTime, nullable=True)

    user = db.relationship('User', backref=db.backref('transactions', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'amount': self.amount,
            'status': self.status,
            'request_date': self.request_date.isoformat() if self.request_date else None,
            'approval_date': self.approval_date.isoformat() if self.approval_date else None
        }


